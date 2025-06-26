import { setLockedAndUpdateMessage } from "../../functions/lockTicket.js";
import { defaultLockTicketPermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import type { StringSelectMenuInteraction } from "discord.js";

export default {
    data: {
        customId: "ticket-lock-reason",
    },
    execute: async ({
        interaction,
    }: {
        interaction: StringSelectMenuInteraction;
    }) => {
        checkBotPermissions(interaction, defaultLockTicketPermissions);

        let value = interaction.values[0];

        switch (value) {
            case "ticket-lock-reason-other":
                setLockedAndUpdateMessage(interaction);
                break;
            case "ticket-lock-reason-off-topic":
                setLockedAndUpdateMessage(interaction, "as **off-topic**");
                break;
            case "ticket-lock-reason-too-heated":
                setLockedAndUpdateMessage(interaction, "as **too heated**");
                break;
            case "ticket-lock-reason-resolved":
                setLockedAndUpdateMessage(interaction, "as **resolved**");
                break;
            case "ticket-lock-reason-spam":
                setLockedAndUpdateMessage(interaction, "as **spam**");
                break;
            default:
                break;
        }
    },
};
