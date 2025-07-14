import { Events, EmbedBuilder } from "discord.js";
import { checkLoggingChannel } from "../../utilities/database.js";
import { emojis } from "../../utilities/emojis.js";
export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(client, member) {
        const guild = member.guild;
        const accountAge = Date.now() - member.user.createdTimestamp;
        const oneDay = 1000 * 60 * 60 * 24;
        const sevenDays = oneDay * 7;
        // If account is younger than 7 days
        if (accountAge < sevenDays) {
            try {
                await member.send({
                    content: `## ${guild.name}`,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${emojis.timeout} Time outed`)
                            .setDescription(`You might be questioning why you’re timed out...\nSince your account is younger than 7 days, you have been restricted temporarily.`)
                            .setColor(process.env.EMBED_COLOR)
                            .setThumbnail(guild.iconURL() ?? null)
                            .setTimestamp(),
                    ],
                });
                const logEmbed = new EmbedBuilder()
                    .setTitle(`${emojis.timeout} Timed out New Member`)
                    .setDescription(`User <@${member.user.id}> (${member.user.username}) joined. Account age < 7 days, so timed out for one week.`)
                    .setThumbnail(member.user.displayAvatarURL() ?? null)
                    .setColor(process.env.EMBED_COLOR)
                    .setFooter({
                    text: guild.name,
                    iconURL: guild.iconURL() ?? undefined,
                });
                await member.disableCommunicationUntil(new Date(Date.now() + sevenDays), "Account is younger than 7 days.");
                const channelId = (await checkLoggingChannel(guild.id)) ??
                    "961144092782374942";
                const fetched = await guild.channels.fetch(channelId);
                if (fetched?.isTextBased()) {
                    fetched
                        .send({ embeds: [logEmbed] })
                        .catch(console.error);
                }
                else {
                    console.log(`Logging channel not found in ${guild.name}`);
                }
            }
            catch (error) {
                console.error("Error handling GuildMemberAdd:", error);
            }
        }
    },
};
