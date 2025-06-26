import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads all components (buttons, select menus, modals) for the bot.
 *
 * This function goes through the components folder, loads the component files
 * (buttons, select menus, modals), and registers them with the client.
 * It makes sure that only valid components with the proper structure are added.
 * The function checks for the required `customId` field to identify each component.
 *
 * Call this function to register all the interactive components when the bot is set up.
 *
 * @param {Client} client - The Discord client to register the components with.
 * @returns {Promise<void>} Resolves when all components are successfully loaded.
 * @author İbrahim Güneş
 */
export const componentHandler = async (client) => {
    try {
        // Get all folders inside the 'components' directory
        const componentFolders = fs.readdirSync(
            path.join(__dirname, "../components")
        );

        // Loop through each folder (e.g., buttons, selectMenus, modals)
        for (const folder of componentFolders) {
            const folderPath = path.join(__dirname, "../components", folder);
            if (!fs.lstatSync(folderPath).isDirectory()) continue; // Skip non-folder files

            // Get all component files in the folder
            const componentFiles = fs
                .readdirSync(folderPath)
                .filter((file) => file.endsWith(".js"));

            // Import and register each component
            for (const file of componentFiles) {
                const { default: component } = await import(
                    `../components/${folder}/${file}`
                );

                // Skip invalid components
                if (!component || !component.data || !component.data.customId) {
                    console.warn(
                        chalk.yellow(
                            `[Components]: Skipped ${file} (invalid structure)`
                        )
                    );
                    continue;
                }

                // Register the component based on its type (button, select menu, modal)
                switch (folder) {
                    case "buttons":
                        client.buttons.set(component.data.customId, component);
                        console.log(
                            chalk.green(
                                `[Buttons]: Loaded ${component.data.customId}`
                            )
                        );
                        break;
                    case "selectMenus":
                        client.selectMenus.set(
                            component.data.customId,
                            component
                        );
                        console.log(
                            chalk.green(
                                `[Select Menus]: Loaded ${component.data.customId}`
                            )
                        );
                        break;
                    case "modals":
                        client.modals.set(component.data.customId, component);
                        console.log(
                            chalk.green(
                                `[Modals]: Loaded ${component.data.customId}`
                            )
                        );
                        break;
                    default:
                        console.warn(
                            chalk.yellow(
                                `[Components]: Unknown category: ${folder}`
                            )
                        );
                        break;
                }
            }
        }
    } catch (error) {
        console.error(
            chalk.red(`[Components]: Error loading components - ${error}`)
        );
    }
};
