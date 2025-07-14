import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const eventHandler = async (client) => {
    const dirs = fs.readdirSync(path.join(__dirname, "../events"));
    for (const dir of dirs) {
        const folder = path.join(__dirname, "../events", dir);
        if (!fs.lstatSync(folder).isDirectory())
            continue;
        const files = fs
            .readdirSync(folder)
            .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));
        for (const f of files) {
            const { default: event } = (await import(path.join(folder, f)));
            if (!event?.name || !event.execute) {
                console.warn(chalk.yellow(`[Events]: Skipped ${f}`));
                continue;
            }
            if (event.once)
                client.once(event.name, (...args) => event.execute(...args, client));
            else
                client.on(event.name, (...args) => event.execute(...args, client));
            console.log(chalk.green(`[Events]: Loaded ${event.name}`));
        }
    }
};
