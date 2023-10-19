import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "./command";
import { supabaseClient } from "../supabase/supabase";
import { Database } from "../supabase/types";

const popRandom = <T>(array: T[]): T => {
  const index = (array.length * Math.random()) | 0;
  return array.splice(index, 1)[0];
};

declare type Answer = Database["public"]["Tables"]["answers"]["Row"];
declare type Question = Database["public"]["Tables"]["questions"]["Row"];
declare type QuestionWithAnswers = Question & { answers: Answer[] };

async function* askQuestions(
  interaction: ChatInputCommandInteraction,
  questions: QuestionWithAnswers[],
) {
  for (let i = 0; i < questions.length; i++) {
    try {
      const question = questions[i];
      const answerButtons = question.answers.map((answer) => {
        return new ButtonBuilder()
          .setCustomId(`${answer.id}`)
          .setLabel(answer.text)
          .setStyle(ButtonStyle.Primary);
      });

      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...answerButtons,
      );

      const response = await interaction.editReply({
        content: question.text,
        components: [buttonRow],
      });
      try {
        const pressedButton = await response.awaitMessageComponent({
          time: question.time_to_answer * 1000,
        });
        await pressedButton.update({ content: `Ответ принят`, components: [] });

        const answer = question.answers.find(
          (answer) => `${answer.id}` === pressedButton.customId,
        );
        yield answer?.is_correct ?? false;
      } catch (error) {
        console.error(error);
        yield false;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

class QuizCommand extends Command {
  public async execute(interaction: ChatInputCommandInteraction) {
    const supabase = await supabaseClient;
    const moduleId = interaction.options.getString("module");

    if (!moduleId) {
      return interaction.reply({
        content: "Invalid command option",
        ephemeral: true,
      });
    }

    const { data: modules } = await supabase
      .from("modules")
      .select("*,questions(*,answers(*))")
      .filter("id", "eq", moduleId);

    if (!modules || modules.length === 0) {
      return interaction.reply({
        content: "Модуль не найден",
        ephemeral: true,
      });
    }

    const module = modules[0];
    if (!module.is_published) {
      return interaction.reply({
        content: "Модуль недоступен",
        ephemeral: true,
      });
    }

    const allQuestions = [...module.questions];
    const questions = Array.from({ length: module.quiz_question_amount }, () =>
      popRandom(allQuestions),
    );

    await interaction.reply({
      content: `${module.name} содержит ${module.quiz_question_amount} вопросов`,
      ephemeral: true,
    });

    const result: boolean[] = [];
    for await (const isCorrect of askQuestions(interaction, questions)) {
      result.push(isCorrect);
    }

    const total = result.reduce((total, isCorrect) => {
      total += isCorrect ? 1 : 0;
      return total;
    }, 0);
    await interaction.editReply(
      `${total} верных ответов из ${module.quiz_question_amount} \n Модуль завершен. Ты гигачад ${module.name}`,
    );
  }
}

export const quiz = new QuizCommand(
  "quiz",
  "Начать квиз по Godot/Gdscipt",
  async (data) => {
    const supabase = await supabaseClient;
    const { data: modules } = await supabase.from("modules").select();

    const choises = (modules ?? [])
      .filter((module) => module.is_published)
      .map((module) => ({
        name: module.name,
        value: `${module.id}`,
      }));

    return data.addStringOption((option) => {
      return option
        .setName("module")
        .setDescription("Модуль квиза")
        .setRequired(true)
        .addChoices(...choises);
    });
  },
);
