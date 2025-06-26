import { Events, GuildScheduledEventStatus } from "discord.js";

export default {
    name: Events.GuildScheduledEventUpdate,
    once: false,
    execute: async (oldGuildScheduledEvent: any, newGuildScheduledEvent: any) => {
        // Checking if the event was initiated by the bot
        if (
            newGuildScheduledEvent.guild.client.user.id ===
            process.env.CLIENT_ID
        ) {
            return;
        }

        // // If the event is now active, we need to add all the users to the database
        // if (
        //     oldGuildScheduledEvent.status ===
        //         GuildScheduledEventStatus.Scheduled &&
        //     newGuildScheduledEvent.status === GuildScheduledEventStatus.Active
        // ) {
        //     try {
        //         const users = newGuildScheduledEvent.guild.members.cache;
        //         const eventUsers = await UserForScheduledEvents.find({
        //             guildScheduledEventId: newGuildScheduledEvent.id,
        //         });

        //         for (const [, user] of users) {
        //             // Check if the user is already in the eventUsers array
        //             const isUserInEvent = eventUsers.some(
        //                 (eventUser) => eventUser.userId === user.id,
        //             );
        //             if (!isUserInEvent) {
        //                 const newUser = new UserForScheduledEvents({
        //                     userId: user.id,
        //                     guildScheduledEventId: newGuildScheduledEvent.id,
        //                 });
        //                 await newUser.save();
        //                 console.log(
        //                     chalk.greenBright(
        //                         `${user.tag} has joined the event ${newGuildScheduledEvent.name}`,
        //                     ),
        //                 );
        //             }
        //         }
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }

        // // If the event is over and the status is completed, we need to remove all the users from the database
        // if (
        //     oldGuildScheduledEvent.status ===
        //         GuildScheduledEventStatus.Active &&
        //     newGuildScheduledEvent.status ===
        //         GuildScheduledEventStatus.Completed
        // ) {
        //     try {
        //         await UserForScheduledEvents.deleteMany({
        //             guildScheduledEventId: newGuildScheduledEvent.id,
        //         });
        //         console.log(
        //             chalk.greenBright(
        //                 `All users have left the event ${newGuildScheduledEvent.name}`,
        //             ),
        //         );
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }
    },
};
