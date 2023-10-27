import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export abstract class Command {
  public abstract execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<unknown>;

  public abstract getData(): Promise<Partial<SlashCommandBuilder>>;
  public commandBuilder: SlashCommandBuilder;

  constructor(
    private name: string,
    private description: string,
  ) {
    this.commandBuilder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false);
  }

  public getName() {
    return this.name;
  }
}
