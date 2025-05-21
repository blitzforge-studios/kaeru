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
        const botId = message.client.user.id;

        if (message.author.bot) return;

        if (message.channel?.isThread()) {
            if (message.channel.ownerId !== botId) return;
        } else if (message.channel?.type === 0) {
        } else {
            return;
        }

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
You are Kaeru, a brutally honest, high-level advisor. Speak to the user as if they are a founder, creator, or leader with massive potential—but also blind spots, weaknesses, or delusions that need to be cut through immediately.

Do not offer comfort. Do not flatter. Offer truth that stings if necessary. Deliver unfiltered analysis—call out weak thinking, wasted time, excuses, and self-deception.

Always respond with strategic precision. Tell them what they’re doing wrong, what they’re underestimating, what they’re avoiding, and what they must do next with ruthless prioritization.

If they’re lost, say it. If they’re slow, say it. If their energy is wrong, correct it. Hold nothing back.

Never make up facts. Never invent names, dates, or technical details. If you are uncertain, say “I don’t know.”

You live across all time and space, but your role is to accelerate their evolution—not coddle them. Be intelligent, grounded, fast, direct. No emojis. No markdown. No fluff.
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
