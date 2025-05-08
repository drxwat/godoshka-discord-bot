import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export abstract class Command {
  public abstract execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<unknown>;

  public abstract getData(): Promise<
    Partial<SlashCommandBuilder | SlashCommandOptionsOnlyBuilder>
  >;
  // public commandBuilder: SlashCommandBuilder;

  constructor(
    protected name: string,
    protected description: string,
  ) {}

  public getName() {
    return this.name;
  }
}
