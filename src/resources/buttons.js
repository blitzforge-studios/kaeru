import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { emojis } from "./emojis.js";

let lockButton = new ButtonBuilder()
	.setCustomId("ticket-lock-conversation")
	.setLabel("Lock Ticket")
	.setStyle(ButtonStyle.Secondary)
	.setDisabled(false)
	.setEmoji(emojis.ticket.bubble.lock);

let karuButton = new ButtonBuilder()
	.setCustomId("karu-button")
	.setLabel("Kāru AI (Beta)")
	.setStyle(ButtonStyle.Secondary)
	.setDisabled(false)
	.setEmoji(emojis.intelligence);

const lockButtonRow = new ActionRowBuilder().addComponents(
	lockButton,
	karuButton,
);

export { lockButtonRow };
