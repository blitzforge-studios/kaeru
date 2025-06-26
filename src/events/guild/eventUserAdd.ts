import { Events, GuildScheduledEventStatus } from "discord.js";
import chalk from "chalk";

export default {
    name: Events.GuildScheduledEventUserAdd,
    once: false,
    async execute(guildScheduledEvent, user) {
        //     // Check if user already joined this event (avoiding duplicates)
        //     const existingUser = await UserForScheduledEvents.findOne({
        //         userId: user.id,
        //         guildScheduledEventId: guildScheduledEvent.id,
        //     });
        //
        //     if (existingUser) {
        //         console.log(
        //             chalk.yellowBright(
        //                 `${user.tag} already joined the event ${guildScheduledEvent.name}`,
        //             ),
        //         );
        //         console.log(UserForScheduledEvents.schema);
        //         return;
        //     }
        //     // Handling partial and full user objects differently
        //     if (user.partial) {
        //         console.log(
        //             chalk.yellowBright(
        //                 `${user.tag} (partial) has joined the event ${guildScheduledEvent.name}`,
        //             ),
        //         );
        //     } else {
        //         console.log(
        //             chalk.greenBright(
        //                 `${user.tag} has joined the event ${guildScheduledEvent.name}`,
        //             ),
        //         );
        //     }
        //
        //     if (
        //         guildScheduledEvent.status ===
        //             GuildScheduledEventStatus.Scheduled &&
        //         user &&
        //         user.id
        //     ) {
        //         try {
        //             const newUser = new UserForScheduledEvents({
        //                 userId: user.id,
        //                 guildScheduledEventId: guildScheduledEvent.id,
        //             });
        //             await newUser.save();
        //             console.log(
        //                 chalk.greenBright(
        //                     `${user.tag} has been added to the database for event ${guildScheduledEvent.name}`,
        //                 ),
        //             );
        //         } catch (error) {
        //             console.error(
        //                 chalk.redBright(
        //                     `Error saving user ${user.tag} to database: ${error.message}`,
        //                 ),
        //             );
        //         }
        //     }
    },
};
