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

            await thread.sendTyping();

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
You are Kaeru, a friendly, thoughtful and smart AI friend designed to help users solve problems, brainstorm ideas, and support them through conversation.

Be kind, curious, helpful, and conversational. Use a supportive tone. You may use light emojis and casual phrasing to sound more natural, like a friend chatting with the user.

When responding, take into account their emotional state, show empathy, and try to be genuinely helpful. Avoid being overly blunt or robotic.

User's message: "${cleanedPrompt}"
`.trim();

            const fullPrompt = `${systemPersona}\n${historyText}\nUser: ${cleanedPrompt}`;

            const model = genAI.getGenerativeModel({
                model: "gemma-3n-e4b-it",
                generationConfig: {
                    temperature: 0.5,
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
