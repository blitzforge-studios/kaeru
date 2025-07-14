import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	ContextMenuCommandBuilder,
	InteractionContextType,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	type UserContextMenuCommandInteraction,
} from "discord.js";
import { emojis } from "../../utilities/emojis.js";
import { basePermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";

export default {
	data: new ContextMenuCommandBuilder()
		.setName("User Banner")
		.setNameLocalizations({
			it: "Banner Utente",
			tr: "Kullanıcı Afişi",
			ro: "Banner Utilizator",
			el: "Σημαιάκι Χρήστη",
			"pt-BR": "Banner do Usuário",
			"zh-CN": "用户横幅",
		} as Record<string, string>)
		.setType(ApplicationCommandType.User)
		.setIntegrationTypes([
			ApplicationIntegrationType.UserInstall,
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.BotDM,
			InteractionContextType.PrivateChannel,
			InteractionContextType.Guild,
		]),

	async execute(
		interaction: UserContextMenuCommandInteraction,
	): Promise<void> {
		if (
			interaction.inGuild() &&
			!(await checkAppPermissions(interaction, basePermissions))
		)
			return;

		const isUserInstallOnly = Object.keys(
			interaction.authorizingIntegrationOwners,
		).every(
			(key) => key === ApplicationIntegrationType.UserInstall.toString(),
		);

		if (isUserInstallOnly) {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		} else {
			await interaction.deferReply();
		}

		try {
			const user = await interaction.client.users.fetch(
				interaction.targetUser.id,
				{ force: true },
			);
			const bannerUrl = user.bannerURL({ size: 4096 });

			if (!bannerUrl) {
				await interaction.editReply({
					content: `${emojis.danger} Hmm, looks like this user doesn’t have a banner set. Maybe it’s lost in the folds of time?`,
				});
				return;
			}

			const intro = new TextDisplayBuilder().setContent(
				[
					`# ${emojis.banner} Hey there!`,
					`You're checking out @${user.username}'s banner. Pretty neat, right?`,
				].join("\n"),
			);
			const gallery = new MediaGalleryBuilder().addItems(
				new MediaGalleryItemBuilder().setURL(bannerUrl),
			);
			const container = new ContainerBuilder()
				.setAccentColor(0xa2845e)
				.addTextDisplayComponents(intro)
				.addMediaGalleryComponents(gallery);

			await interaction.editReply({
				components: [container],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			console.error("Error fetching user banner:", error);
			await interaction.editReply({
				content: `${emojis.error} Oops! Something went wrong. Maybe a glitch in the timeline?`,
			});
		}
	},
} as const;
