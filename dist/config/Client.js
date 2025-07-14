import { Client, Collection, GatewayIntentBits, Partials, } from "discord.js";
const clientOptions = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildScheduledEvents,
    ],
    partials: [Partials.GuildMember, Partials.Message, Partials.Channel],
};
export const client = new Client(clientOptions);
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];
