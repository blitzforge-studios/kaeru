import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { emojis } from "./emojis.js";
const lockButton = new ButtonBuilder()
    .setCustomId("ticket-lock-conversation")
    .setLabel("Lock Ticket")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(false)
    .setEmoji(emojis.ticketLock);
export const lockButtonRow = new ActionRowBuilder().addComponents(lockButton);
