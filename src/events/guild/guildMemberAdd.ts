import { EmbedBuilder, Events } from "discord.js";
import { checkLoggingChannel } from "../../functions/database.js";
import { emojis } from "../../resources/emojis.js";

export default {
    name: Events.GuildMemberAdd,
    once: false,
    execute: async (member: any) => {
        const guild = member.guild;
        const accountAge = Date.now() - member.user.createdTimestamp;
        const oneDayInMillis = 1000 * 60 * 60 * 24;
        const sevenDaysInMillis = oneDayInMillis * 7;
        const channelId = (await checkLoggingChannel(guild.id)) || null;
        const channel =
            guild.channels.cache.get(channelId) || "961144092782374942";

        if (accountAge < sevenDaysInMillis) {
            try {
                await member.send({
                    content: `## ${guild.name}`,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${emojis.timeout} Time outed`)
                            .setDescription(
                                "You might be questioning why are you timeouted...\nWell, since your account is younger than 7 days, I have restricted you temporarily."
                            )
                            .setColor(process.env.EMBED_COLOR! as any)
                            .setThumbnail(guild.iconURL())
                            .setTimestamp(),
                    ],
                });

                const embed = new EmbedBuilder()
                    .setTitle(`${emojis.timeout} Time outed New Member`)
                    .setDescription(
                        `User <@${member.user.id}> (${member.user.username}) has joined the server. Their account is younger than 7 days. They have been temporarily restricted. Aka they are timeouted for one week.`
                    )
                    .setThumbnail(member.user.displayAvatarURL())
                    .setColor(process.env.EMBED_COLOR! as any)
                    .setFooter({
                        text: guild.name,
                        iconURL: guild.iconURL(),
                    });
                await member
                    .disableCommunicationUntil(
                        new Date(Date.now() + sevenDaysInMillis),
                        `Account is younger than 7 days.`
                    )
                    .catch(console.error);
                if (channel) {
                    const logginChannel = await guild.channels.fetch(channelId);

                    await logginChannel.send({ embeds: [embed] });
                } else {
                    console.log(
                        "Logging channel not found. Skipping logging in " +
                            guild.name
                    );
                }
            } catch (error) {
                console.error("Failed to send message to channel:", error);
            }
        }
    },
};
