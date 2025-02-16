import { setLockedAndUpdateMessage } from "../../functions/lockTicket.js";
import { defaultLockTicketPermissions } from "../../resources/BotPermissions.js";
import { checkPermissions } from "../../functions/checkPermissions.js";

export default {
    data: {
        customId: "ticket-lock-reason",
    },
    execute: async ({ interaction }) => {
        checkPermissions(interaction, defaultLockTicketPermissions);

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
