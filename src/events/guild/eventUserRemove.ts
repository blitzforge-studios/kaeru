import { Events } from "discord.js";

export default {
    name: Events.GuildScheduledEventUserRemove,
    once: false,
    execute: async (guildScheduledEvent: any, user: any) => {
        // try {
        //     await UserForScheduledEvents.deleteOne({
        //         userId: user.id,
        //         guildScheduledEventId: guildScheduledEvent.id,
        //     });
        //     console.log(
        //         chalk.redBright(
        //             `${user.tag} has left the event ${guildScheduledEvent.name}`,
        //         ),
        //     );
        // } catch (error) {
        //     console.error(error);
        // }
    },
};
