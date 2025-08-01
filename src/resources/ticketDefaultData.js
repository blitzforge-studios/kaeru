import {
	ContainerBuilder,
	roleMention,
	SectionBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";
import { emojis } from "./emojis.js";
import { getStaffRoleId } from "../functions/database.js";

export const ticketContainerData = async (interaction) => {
	const staffRoleId = await getStaffRoleId(interaction.guild.id);

	const container = new ContainerBuilder().addSectionComponents(
		new SectionBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					[
						`## ${emojis.doorEnter} Now, we did it. Here we are!`,
						`-# [ ${roleMention(staffRoleId)} ]`,
						"",
						"Our staff member(s) will take care of this ticket sooner. While they are on their way, you can give more details if you have to.",
					].join("\n"),
				),
			)
			.setThumbnailAccessory(
				new ThumbnailBuilder().setURL(
					interaction.guild.iconURL({ dynamic: true, size: 1024 }),
				),
			),
	);

	return container.toJSON();
};
