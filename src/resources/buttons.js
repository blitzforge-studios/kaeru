import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { emojis } from "./emojis.js";

let lockButton = new ButtonBuilder()
	.setCustomId("ticket-lock-conversation")
	.setLabel("Lock Ticket")
	.setStyle(ButtonStyle.Secondary)
	.setDisabled(false)
	.setEmoji(emojis.ticket.bubble.lock);

const lockButtonRow = new ActionRowBuilder().addComponents(lockButton);

export { lockButtonRow };
