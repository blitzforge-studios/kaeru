import type { ExtendedClient } from "../config/Client.js";
import type { Button } from "../types/Button.js";
import type { SelectMenu } from "../types/SelectMenu.js";
import type { Modal } from "../types/Modal.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const componentHandler = async (
	client: ExtendedClient,
): Promise<void> => {
	const basePath = path.join(__dirname, "../components");
	const componentFolders = await fs.readdir(basePath);

	for (const folder of componentFolders) {
		const folderPath = path.join(basePath, folder);
		if (!(await fs.stat(folderPath)).isDirectory()) continue;

		const files = (await fs.readdir(folderPath)).filter(
			(file) => file.endsWith(".ts") || file.endsWith(".js"),
		);

		for (const file of files) {
			const { default: component } = (await import(
				path.join(folderPath, file)
			)) as {
				default: {
					data: { customId: string };
					execute: (...args: any[]) => any;
				};
			};

			if (
				!component?.data?.customId ||
				typeof component.execute !== "function"
			) {
				console.warn(
					chalk.yellow(
						`[Components]: Skipped ${file} (invalid structure)`,
					),
				);
				continue;
			}

			switch (folder) {
				case "buttons":
					const buttonComponent: Button = {
						id: component.data.customId,
						execute: component.execute,
					};
					client.buttons.set(
						component.data.customId,
						buttonComponent,
					);
					console.log(
						chalk.green(
							`[Buttons]: Loaded ${component.data.customId}`,
						),
					);
					break;
				case "selectMenus":
					const selectMenuComponent: SelectMenu = {
						id: component.data.customId,
						execute: component.execute,
					};
					client.selectMenus.set(
						component.data.customId,
						selectMenuComponent,
					);
					console.log(
						chalk.green(
							`[Select Menus]: Loaded ${component.data.customId}`,
						),
					);
					break;
				case "modals":
					const modalComponent: Modal = {
						id: component.data.customId,
						execute: component.execute,
					};
					client.modals.set(component.data.customId, modalComponent);
					console.log(
						chalk.green(
							`[Modals]: Loaded ${component.data.customId}`,
						),
					);
					break;
				default:
					console.warn(
						chalk.yellow(
							`[Components]: Unknown folder "${folder}", skipped.`,
						),
					);
			}
		}
	}
};
