import { client } from "../config/Configs.js";
import {
    eventHandler,
    commandHandler,
    componentHandler,
} from "../handlers/Handlers.js";

/**
 * This function loads all the bot's handlers to get it up and running.
 *
 * It makes sure the bot is ready to listen for events, handle commands,
 * and interact with users. Just call it after the bot logs in.
 *
 * @returns {Promise<void>} Resolves when all handlers are loaded.
 * @author İbrahim Güneş
 */
export async function loadHandlers() {
    console.log("Loading event handler...");
    await eventHandler(client);

    console.log("Loading command handler...");
    await commandHandler(client);

    console.log("Loading component handler...");
    await componentHandler(client);

    console.log("All handlers loaded successfully.");
}
