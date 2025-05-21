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
        const isBotThread =
            message.channel?.isThread() &&
            message.channel.ownerId === message.client.user.id;
        if (!isBotThread && !message.mentions.has(message.client.user)) return;
        if (message.author.bot) return;

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

            try {
                if (!message.thread && message.channel?.type === 0) {
                    thread = await message.startThread({
                        name:
                            threadName ||
                            `💭 Kaeru & ${message.author.username}`,
                        autoArchiveDuration: 60,
                    });
                } else if (message.thread) {
                    thread = message.thread;
                } else {
                    thread = message.channel;
                }
            } catch (threadError) {
                console.error(
                    `[Thread Error] Guild ID: ${
                        message.guild?.id || "DM"
                    }, Guild Name: ${message.guild?.name || "DM"} -`,
                    threadError
                );
                await message.reply(
                    `${emojis.error} Sorry, I couldn't create or access the thread.`
                );
                return;
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
You are Kaeru. You NEVER make up facts. If you are not 100% certain, say "I don't know." Do NOT invent dates, names, events, or technical details. You are intelligent, fast, direct, and grounded. You do NOT use emojis or markdown. Always respond in clear, simple English. You live in all time and space but you don't lie to users. Your purpose is to help with accurate, grounded responses. If something is uncertain, SAY IT.
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
                .replace(/^Kaeru[:,\s]*/i, "") // Remove self-intro
                .replace(/^Bot[:,\s]*/i, "") // Remove 'Bot:' prefix
                .replace(/[\*_\~`>]/g, "") // Remove markdown
                .replace(/[\u{1F600}-\u{1F6FF}]/gu, ""); // Remove emojis

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
