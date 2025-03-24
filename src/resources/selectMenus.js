import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { emojis } from "./emojis.js";

let ticketMenu = new StringSelectMenuBuilder()
    .setCustomId("ticket-select-menu")
    .setDisabled(false)
    .setMaxValues(1)
    .setPlaceholder("Action to close ticket")
    .addOptions(
        new StringSelectMenuOptionBuilder()
            .setLabel("Close as completed")
            .setValue("ticket-menu-done")
            .setDescription("Done, closed, fixed, resolved")
            .setEmoji(emojis.ticketDone)
            .setDefault(false),
        new StringSelectMenuOptionBuilder()
            .setLabel("Close as not planned")
            .setValue("ticket-menu-duplicate")
            .setDescription("Won’t fix, can’t repo, duplicate, stale")
            .setEmoji(emojis.ticketStale),
        new StringSelectMenuOptionBuilder()
            .setLabel("Close with comment")
            .setValue("ticket-menu-close")
            .setEmoji(emojis.ticketClose)
    );

let labelMenu = new StringSelectMenuBuilder()
    .setCustomId("ticket-label-menu")
    .setPlaceholder("Select a label for this ticket")
    .setMinValues(1)
    .addOptions(
        new StringSelectMenuOptionBuilder()
            .setLabel("Bug")
            .setValue("label-bug")
            .setEmoji(emojis.label.bugLabel),
        new StringSelectMenuOptionBuilder()
            .setLabel("Reward")
            .setValue("label-reward")
            .setEmoji(emojis.label.rewardLabel),
        new StringSelectMenuOptionBuilder()
            .setLabel("Question")
            .setValue("label-question")
            .setEmoji(emojis.label.questionLabel),
        new StringSelectMenuOptionBuilder()
            .setLabel("Discussion")
            .setValue("label-discussion")
            .setEmoji(emojis.label.discussionLabel),
        new StringSelectMenuOptionBuilder()
            .setLabel("Help")
            .setValue("label-help")
            .setEmoji(emojis.label.helpLabel)
    );

const ticketMenuRow = new ActionRowBuilder().addComponents(ticketMenu);
const labelMenuRow = new ActionRowBuilder().addComponents(labelMenu);

export { ticketMenuRow, labelMenuRow };
