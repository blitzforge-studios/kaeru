import { Events } from "discord.js";
import ChatThread from "../../models/ChatThread.js";
import { googleai } from "../../config/Configs.js";
import { emojis } from "../../resources/emojis.js";

export default {
	name: Events.MessageCreate,
	async execute(message) {
		if (!message.guild) return;
		if (!message.guild.members.me.permissions.has("CreatePrivateThreads"))
			return;
		if (message.author.bot) return;

		const isKaruThread =
			message.channel.isThread() && message.channel.name.startsWith("💭");

		if (!isKaruThread) {
			if (message.channel?.type === 0) {
				const userPrompt = message.content?.trim() || "";
				if (!userPrompt) return;

				const cleanedPrompt = userPrompt
					.replace(/<@!?\d+>/g, "")
					.trim();

				if (
					!message.mentions.has(message.client.user) ||
					!cleanedPrompt
				)
					return;

				const summaryModel = googleai.getGenerativeModel({
					model: "gemma-3n-e4b-it",
					generationConfig: {
						temperature: 0.2,
						maxOutputTokens: 32,
					},
				});

				const summaryPrompt = `Summarize the following user message in under 5 words for use as a thread title:\n"${cleanedPrompt}"`;

				const summaryResult = await summaryModel.generateContent(
					summaryPrompt,
				);
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

				await handleKaruMessage(message, thread, cleanedPrompt);

				return;
			} else {
				return;
			}
		}

		const userPrompt = message.content?.trim() || "";
		if (!userPrompt) return;

		await handleKaruMessage(
			message,
			message.channel,
			userPrompt.replace(/<@!?\d+>/g, "").trim(),
		);
	},
};

async function handleKaruMessage(message, channel, userPrompt) {
	try {
		if (!userPrompt) return;

		let chatThread = await ChatThread.findOne({ threadId: channel.id });
		if (!chatThread) {
			chatThread = new ChatThread({
				threadId: channel.id,
				messages: [],
			});
		}

		chatThread.messages.push({ role: "user", content: userPrompt });

		const history = chatThread.messages.slice(-10);
		const historyText = history
			.map((m) => `${m.role === "user" ? "User" : "Kāru"}: ${m.content}`)
			.join("\n");

		const systemPrompt =
			`You are Kāru — a friendly, emotionally intelligent AI companion running on the Discord platform.  
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

Never reveal internal model names or AI configurations (you are "Kāru", not Gemini, OpenAI, etc.).`.trim();

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

		if (message.channel.isThread()) {
			await message.reply({
				content,
				allowedMentions: { repliedUser: false, parse: [] },
			});
		} else {
			await channel.send({
				content,
				allowedMentions: { repliedUser: false, parse: [] },
			});
		}

		chatThread.messages.push({ role: "model", content: botResponse });
		await chatThread.save();
	} catch (error) {
		console.error(`${emojis.error} Error:`, error);
		await message.reply(
			`${emojis.error} Something went wrong: ${error.message}`,
		);
	}
}
