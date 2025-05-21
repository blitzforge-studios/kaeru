// Exporting the functions and properties from the config files
export { client } from "./clientConfig.js";
export { botPresence } from "./botPresence.js";
export { botLogin } from "./botLogin.js";

export const googleai = {
    apiKey: process.env.GOOGLE_AI_API_KEY,
};
