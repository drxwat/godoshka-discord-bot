import { Command } from "./command";
import { quiz } from "./quiz";
import { scores } from "./scores";

export const commands = new Map<string, Command>([
  [quiz.getName(), quiz],
  [scores.getName(), scores],
]);
