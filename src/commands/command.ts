import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export abstract class Command {
  public abstract execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<unknown>;
  private data: Promise<Partial<SlashCommandBuilder>>;

  constructor(
    private name: string,
    private description: string,
    builder: (
      data: SlashCommandBuilder,
    ) => Promise<Partial<SlashCommandBuilder>>,
  ) {
    this.data = builder(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDMPermission(false),
    );
  }

  public async getData() {
    return this.data;
  }

  public getName() {
    return this.name;
  }
}
