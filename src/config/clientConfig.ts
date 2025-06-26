import {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
} from "discord.js";
import type { ExtendedClient } from "../types/ExtendedClient.js";

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildScheduledEvents,
    ],
    partials: [Partials.GuildMember, Partials.Message, Partials.Channel],
}) as ExtendedClient;

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];
