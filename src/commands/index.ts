import { Command } from "./command";
import { quiz } from "./quiz";

export const commands = new Map<string, Command>([[quiz.getName(), quiz]]);
