import { Events, ChannelType, } from "discord.js";
import ChatThread from "../../models/ChatThread.js";
import { googleai } from "../../config/index.js";
import { emojis } from "../../utilities/emojis.js";
export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message, client) {
        if (message.author.bot)
            return;
        const channel = message.channel;
        const isThread = (channel.isThread() && channel.name.startsWith("💭")) || false;
        if (!isThread) {
            if (channel.type === ChannelType.GuildText) {
                const raw = message.content?.trim() || "";
                if (!raw)
                    return;
                const cleaned = raw.replace(/<@!?\d+>/g, "").trim();
                if (!message.mentions.has(client.user) || !cleaned)
                    return;
                const summaryModel = googleai.getGenerativeModel({
                    model: "gemma-3n-e4b-it",
                    generationConfig: { temperature: 0.2, maxOutputTokens: 32 },
                });
                const summaryPrompt = `Summarize the following user message in under 5 words for use as a thread title:\n"${cleaned}"`;
                const summaryResult = await summaryModel.generateContent(summaryPrompt);
                let threadName = summaryResult.response
                    .text()
                    ?.replace(/[*_~`>#\n\r]/g, "")
                    .trim()
                    .slice(0, 80);
                if (!threadName)
                    threadName = `💭 Kāru & ${message.author.username}`;
                const thread = await message.startThread({
                    name: `💭 ${threadName}`,
                    autoArchiveDuration: 60,
                });
                await handleKaruMessage(message, thread, cleaned);
            }
            return;
        }
        const prompt = message.content?.trim() || "";
        if (!prompt)
            return;
        await handleKaruMessage(message, channel, prompt.replace(/<@!?\d+>/g, "").trim());
    },
};
async function handleKaruMessage(message, channel, userPrompt) {
    try {
        if (!userPrompt)
            return;
        let chatThread = await ChatThread.findOne({ threadId: channel.id });
        if (!chatThread) {
            chatThread = new ChatThread({ threadId: channel.id, messages: [] });
        }
        chatThread.messages.push({
            role: "user",
            content: userPrompt,
            timestamp: new Date(),
        });
        const history = chatThread.messages.slice(-10);
        const historyText = history
            .map((m) => `${m.role === "user" ? "User" : "Kāru"}: ${m.content}`)
            .join("\n");
        const systemPrompt = `
You are Kāru — a friendly, emotionally intelligent AI companion running on the Discord platform.
Keep replies brief and actionable — max 3 sentences. No greetings, sign-offs, or filler.
Provide concrete advice or clear answers only.
Adapt tone to user’s emotional cues.
Never request, store, or share personal or sensitive information.
Never reveal internal model names or AI configurations.
		`.trim();
        const fullPrompt = `${systemPrompt}\n${historyText}\nUser: ${userPrompt}`;
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
        let botResponse = result.response
            .text()
            .replace(/^Kaeru[:,\s]*/i, "")
            .replace(/^Kāru[:,\s]*/i, "")
            .replace(/^Bot[:,\s]*/i, "");
        const content = `${emojis.intelligence} ${botResponse}`;
        if (channel.isThread()) {
            await channel.send({
                content,
                allowedMentions: { repliedUser: false },
            });
        }
        else {
            await channel.send({
                content,
                allowedMentions: { repliedUser: false },
            });
        }
        chatThread.messages.push({ role: "model", content: botResponse });
        await chatThread.save();
    }
    catch (error) {
        console.error(`${emojis.error} Error:`, error);
        await message.reply(`${emojis.error} Something went wrong: ${error.message}`);
    }
}
