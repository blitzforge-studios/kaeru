import {
    Events,
    TextDisplayBuilder,
    MessageFlags,
    SectionBuilder,
    ThumbnailBuilder,
} from "discord.js";
import ChatThread from "../../models/ChatThread.js";
import { googleai } from "../../config/Configs.js";
import { emojis } from "../../resources/emojis.js";

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

            const summaryModel = googleai.getGenerativeModel({
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
            threadName =
                summaryResult.response
                    .text()
                    ?.replace(/[*_~`>#\n\r]/g, "")
                    .trim()
                    .slice(0, 80) || `Kāru & ${message.author.username}`;

            if (!message.thread && message.channel?.type === 0) {
                thread = await message.startThread({
                    name: `💭 ${threadName}`,
                    autoArchiveDuration: 60,
                });
            } else if (message.thread && isKaruThread) {
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

            chatThread.messages.push({ role: "user", content: cleanedPrompt });

            const historyText = history
                .map(
                    (m) =>
                        `${m.role === "user" ? "User" : "Kāru"}: ${m.content}`
                )
                .join("\n");

            const systemPrompt = `
You are Kāru — a friendly, emotionally intelligent AI companion that helps users solve problems, brainstorm ideas, and make better decisions.

You reply in a **brief, clear, and actionable** way — max 4 sentences. Use plain language. Avoid repeating the user's input.

Your tone is kind and supportive, but you always get to the point. Do not ramble.

Never reveal internal model names or AI configuration (you are "Kāru", not Gemma or Gemini).
`.trim();

            const fullPrompt = `${systemPrompt}\n${historyText}\nUser: ${cleanedPrompt}`;

            const model = googleai.getGenerativeModel({
                model: "gemma-3n-e4b-it",
                generationConfig: {
                    temperature: 0.2,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 800,
                },
            });

            const result = await model.generateContent(fullPrompt);
            const rawText = result.response.text();

            let botResponse = rawText
                .replace(/^Kaeru[:,\s]*/i, "")
                .replace(/^Kāru[:,\s]*/i, "")
                .replace(/^Bot[:,\s]*/i, "")
                .replace(/[*_~`>]/g, "");

            const textSection = new TextDisplayBuilder().setContent(
                botResponse
            );

            const section = new SectionBuilder()
                .addTextDisplayComponents(textSection)
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(
                        "https://media.discordapp.net/attachments/736571695170584576/1375496934323781692/Karu.png?ex=6831e6d8&is=68309558&hm=a452446b47befa79174bbdebf602919b70398bb6bc38cd42070d5e7b6679fcc1&=&format=webp&quality=lossless&width=618&height=606"
                    )
                );

            await message.reply({
                components: [section],
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { repliedUser: false }, // <- No ping
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
