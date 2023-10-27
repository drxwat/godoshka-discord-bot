import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export abstract class Command {
  public abstract execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<unknown>;

  public abstract getData(): Promise<Partial<SlashCommandBuilder>>;
  // public commandBuilder: SlashCommandBuilder;

  constructor(
    protected name: string,
    protected description: string,
  ) {}

  public getName() {
    return this.name;
  }
}
