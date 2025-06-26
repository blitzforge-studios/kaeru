export { client } from "./clientConfig.js";
export { botPresence } from "./botPresence.js";
export { botLogin } from "./botLogin.js";

import { GoogleGenerativeAI } from "@google/generative-ai";

export const googleai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
