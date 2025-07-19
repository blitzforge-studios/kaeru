import { Events, PermissionsBitField } from "discord.js";
import ChatThread from "../../models/ChatThread.js";
import { googleai } from "../../config/Configs.js";
import { emojis } from "../../resources/emojis.js";

export default {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;
		const channel = message.channel;
		if (channel.isThread()) {
			const userPrompt = message.content.trim();
			if (!userPrompt) return;
			await handleKaruMessage(
				message,
				channel,
				userPrompt.replace(/<@!?\d+>/g, "").trim(),
			);
			return;
		}
		if (channel.type === 0) {
			if (!message.mentions.has(message.client.user)) return;
			const userPrompt = message.content
				.trim()
				.replace(/<@!?\d+>/g, "")
				.trim();
			if (!userPrompt) return;
			const botMember = message.guild.members.me;
			if (
				!botMember.permissions.has(
					PermissionsBitField.Flags.CreatePublicThreads,
				)
			)
				return;
			const summaryModel = googleai.getGenerativeModel({
				model: "gemma-3n-e4b-it",
				generationConfig: { temperature: 0.2, maxOutputTokens: 32 },
			});
			const summaryResult = await summaryModel.generateContent(
				`Summarize the following user message in under 5 words for use as a thread title:\n"${userPrompt}"`,
			);
			let threadName = summaryResult.response
				.text()
				.replace(/[*_~`>#\n\r]/g, "")
				.trim()
				.slice(0, 80);
			if (!threadName)
				threadName = `💭 Kāru & ${message.author.username}`;
			try {
				const thread = await channel.startThread({
					name: `💭 ${threadName}`,
					autoArchiveDuration: 60,
				});
				await handleKaruMessage(message, thread, userPrompt);
			} catch (error) {
				console.error(emojis.error, error);
				await message.reply(
					`${emojis.error} Could not create thread: ${error.message}`,
				);
			}
		}
	},
};

async function handleKaruMessage(message, channel, userPrompt) {
	if (!userPrompt) return;
	let chatThread = await ChatThread.findOne({ threadId: channel.id });
	if (!chatThread) {
		chatThread = new ChatThread({ threadId: channel.id, messages: [] });
	}
	chatThread.messages.push({ role: "user", content: userPrompt });
	const history = chatThread.messages.slice(-10);
	const historyText = history
		.map((m) => `${m.role === "user" ? "User" : "Kāru"}: ${m.content}`)
		.join("\n");
	const systemPrompt = `You are Kāru — a friendly, emotionally intelligent AI companion running on the Discord platform.
You communicate through Discord threads and messages.
Keep replies brief and actionable — max 3 sentences.
No greetings, sign-offs, or filler. No repetition of user input.
Provide concrete advice or clear answers only.
Adapt tone to user’s emotional cues: empathetic if frustrated, energetic if excited, professional if confused.
Maintain consistent personality and facts throughout the conversation.
If unsure, admit it clearly and suggest alternatives or clarifications.
Prioritize recent messages and user questions; use history only for context, not repetition.
Use language and references suitable for Discord users.
Encourage users to ask follow-ups without being pushy.
Never request, store, or share personal or sensitive information.
Never reveal internal model names or AI configurations (you are "Kāru", not Gemini, OpenAI, etc.).`;
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
	const rawText = result.response.text();
	let botResponse = rawText
		.replace(/^Kaeru[:,\s]*/i, "")
		.replace(/^Kāru[:,\s]*/i, "")
		.replace(/^Bot[:,\s]*/i, "");
	const content = emojis.intelligence + " " + botResponse;
	const sendTo = channel.isThread()
		? message.reply.bind(message)
		: channel.send.bind(channel);
	try {
		await sendTo({
			content,
			allowedMentions: { repliedUser: false, parse: [] },
		});
		chatThread.messages.push({ role: "model", content: botResponse });
		await chatThread.save();
	} catch (error) {
		console.error(emojis.error, error);
	}
}
