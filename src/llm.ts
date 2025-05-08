import OpenAI from "openai";
import { config } from "./config";

export const LLM = new OpenAI({
  baseURL: config.LLM_BASE_URL,
  apiKey: config.LLM_API_KEY,
});
