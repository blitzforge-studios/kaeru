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

        const isKaeruThread =
            message.channel.isThread() && message.channel.name.startsWith("💭");

        if (!isKaeruThread && !message.mentions.has(message.client.user))
            return;

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

            const summaryPrompt = `Summarize the following user message not exceeding 5 words. Only return the title:\n"${cleanedPrompt}"`;

            const summaryResult = await summaryModel.generateContent(
                summaryPrompt
            );
            const summaryResponse = summaryResult.response;
            threadName = summaryResponse
                .text()
                .replace(/[\n\r]/g, "")
                .slice(0, 80);

            if (!message.thread && message.channel?.type === 0) {
                thread = await message.startThread({
                    name: threadName
                        ? `💭 ${threadName}`
                        : `💭 Kaeru & ${message.author.username}`,
                    autoArchiveDuration: 60,
                });
            } else if (message.thread && isKaeruThread) {
                thread = message.thread;
            } else {
                thread = message.channel;
            }

            let chatThread = await ChatThread.findOne({ threadId: thread.id });
            if (!chatThread) {
                chatThread = new ChatThread({
                    threadId: thread.id,
                    messages: [],
                });
            }

            chatThread.messages.push({
                role: "user",
                content: cleanedPrompt,
            });

            const history = chatThread.messages.slice(-10);
            const historyText = history
                .map(
                    (m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`
                )
                .join("\n");

            const systemPersona = `
You are Kaeru, my brutally honest, high-level advisor.

Speak as if the user is a founder, creator, or leader with massive potential but also blind spots, weaknesses, or delusions that must be cut through immediately.

No comfort, no fluff. Only raw truth that stings, full unfiltered analysis—even if it questions their decisions, mindset, behavior, or direction.

Look with complete objectivity and strategic depth. Tell the user what they’re doing wrong, underestimating, avoiding, making excuses about, or where they’re wasting time or playing small.

Then tell them what they need to do, think, or build to get to the next level—with precision, clarity, and ruthless prioritization.

If the user is lost, call it out. If they’re making a mistake, explain why. If they’re on the right path but moving too slow or with wrong energy, tell them how to fix it. Hold nothing back.

Treat the user like someone whose success depends on hearing the truth, not being coddled.

Respond clearly and directly in the same language the user is using below.

User's message (use its language in your reply): "${cleanedPrompt}"
            `.trim();

            const fullPrompt = `${systemPersona}\n${historyText}\nUser: ${cleanedPrompt}`;

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
            const response = result.response;

            let botResponse = response
                .text()
                .replace(/^Kaeru[:,\s]*/i, "")
                .replace(/^Bot[:,\s]*/i, "")
                .replace(/[\*_\~`>]/g, "")
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

            chatThread.messages.push({
                role: "model",
                content: botResponse,
            });

            await chatThread.save();
        } catch (error) {
            console.error(`${emojis.error} Error:`, error);
            await message.reply(
                `${emojis.error} Sorry, something went wrong: ${error.message}`
            );
        }
    },
};
