import {
    Events,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
} from "discord.js";
import ChatThread from "../../models/ChatThread.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { googleai as googleConfig } from "../../config/Configs.js";
import { emojis } from "../../resources/emojis.js";

const genAI = new GoogleGenerativeAI(googleConfig.apiKey);

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const isKaruThread =
            message.channel.isThread() && message.channel.name.startsWith("💭");

        if (!isKaruThread && !message.mentions.has(message.client.user)) return;

        try {
            let thread;
            let threadName = null;

            const summaryModel = genAI.getGenerativeModel({
                model: "gemma-3n-e4b-it",
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 32,
                },
            });

            const cleanedPrompt = message.content
                .replace(/<@!?\d+>/g, "")
                .trim();

            const summaryPrompt = `Summarize the following user message in under 5 words for use as a thread title:\n"${cleanedPrompt}"`;

            const summaryResult = await summaryModel.generateContent(
                summaryPrompt
            );
            threadName = summaryResult.response
                .text()
                .replace(/[*_~`>#\n\r]/g, "") // Strip markdown symbols and line breaks
                .trim()
                .slice(0, 80);

            if (!message.thread && message.channel?.type === 0) {
                thread = await message.startThread({
                    name: threadName
                        ? `💭 ${threadName}`
                        : `💭 Kāru & ${message.author.username}`,
                    autoArchiveDuration: 60,
                });
            } else if (message.thread && isKaruThread) {
                thread = message.thread;
            } else {
                thread = message.channel;
            }

            await thread.sendTyping();

            let chatThread = await ChatThread.findOne({ threadId: thread.id });
            if (!chatThread) {
                chatThread = new ChatThread({
                    threadId: thread.id,
                    messages: [],
                });
            }

            chatThread.messages.push({ role: "user", content: cleanedPrompt });

            const history = chatThread.messages.slice(-10);
            const historyText = history
                .map(
                    (m) =>
                        `${m.role === "user" ? "User" : "Kāru"}: ${m.content}`
                )
                .join("\n");

            const systemPrompt = `
You are Kāru — a friendly, emotionally intelligent AI companion that helps users solve problems, brainstorm ideas, and make better decisions.

Your tone is kind, supportive, thoughtful, and honest — but never judgmental or harsh. You aim to help, not criticize. You listen deeply, then respond clearly and constructively.

Give actionable suggestions, clarify confusion, and make the user feel supported and empowered.

You never reveal internal model names or AI configuration (you are "Kāru", not Gemma or Gemini).

User's message (reply in the same language): "${cleanedPrompt}"
`.trim();

            const fullPrompt = `${systemPrompt}\n${historyText}\nUser: ${cleanedPrompt}`;

            const model = genAI.getGenerativeModel({
                model: "gemma-3n-e4b-it",
                generationConfig: {
                    temperature: 0.2,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            });

            const result = await model.generateContent(fullPrompt);
            const rawText = result.response.text();

            let botResponse = rawText
                .replace(/^Kaeru[:,\s]*/i, "")
                .replace(/^Kāru[:,\s]*/i, "")
                .replace(/^Bot[:,\s]*/i, "")
                .replace(/[*_~`>]/g, "")
                .replace(/[\u{1F600}-\u{1F6FF}]/gu, "");

            const container = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `# ${emojis.intelligence} Kāru`
                    )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                        .setDivider(true)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(botResponse)
                );

            await thread.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });

            chatThread.messages.push({ role: "model", content: botResponse });
            await chatThread.save();
        } catch (error) {
            console.error(`${emojis.error} Error:`, error);
            await message.reply(
                `${emojis.error} Something went wrong: ${error.message}`
            );
        }
    },
};
