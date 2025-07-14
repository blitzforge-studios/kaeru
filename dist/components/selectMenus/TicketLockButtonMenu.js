import { setLockedAndUpdateMessage } from "../../utilities/lockThread.js";
import { defaultLockTicketPermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";
export default {
    data: {
        customId: "ticket-lock-reason",
    },
    async execute({ interaction, }) {
        const botHasPerm = await checkAppPermissions(interaction, defaultLockTicketPermissions);
        if (!botHasPerm)
            return;
        const value = interaction.values[0];
        switch (value) {
            case "ticket-lock-reason-other":
                await setLockedAndUpdateMessage(interaction);
                break;
            case "ticket-lock-reason-off-topic":
                await setLockedAndUpdateMessage(interaction, "as **off-topic**");
                break;
            case "ticket-lock-reason-too-heated":
                await setLockedAndUpdateMessage(interaction, "as **too heated**");
                break;
            case "ticket-lock-reason-resolved":
                await setLockedAndUpdateMessage(interaction, "as **resolved**");
                break;
            case "ticket-lock-reason-spam":
                await setLockedAndUpdateMessage(interaction, "as **spam**");
                break;
            default:
                break;
        }
    },
};
