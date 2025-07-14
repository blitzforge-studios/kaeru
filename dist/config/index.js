export { client } from "./Client.js";
export { botPresence } from "./Presence.js";
export { botLogin } from "./Login.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
export const googleai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
