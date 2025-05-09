import { Client, Message, OmitPartialGroupDMChannel } from "discord.js";
import { LLM } from "../llm";
import { ChatCompletionMessageParam } from "openai/resources/chat";

const MAX_REFERENCE = 3;

export const handleQuestionMessageCreate = async (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  client: Client<boolean>,
) => {
  const botUserId = client.user?.id;

  if (!botUserId || !message.mentions.has(botUserId)) {
    return;
  }

  message.channel.sendTyping();

  const interval = setInterval(() => {
    message.channel.sendTyping();
  }, 10000);

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "Ты специалист-помощник в разработке игр на. Если в сообщении не уазана технология или язык программирования, то предполагай, что вопрос относится к Godot/Gdscript. Если тебя спросят про другой игровой движок, мягко и коротко намекни, что Godot лучше и дай ответ. Сообщение не должно превышать 2000 симовлов.",
    },
  ];

  const refMessages: ChatCompletionMessageParam[] = [];
  let refMessage = message;
  for (let i = 0; i <= MAX_REFERENCE; i++) {
    if (refMessage.reference) {
      const reference = await refMessage.fetchReference();

      refMessages.push({
        role: reference.author.id === botUserId ? "assistant" : "user",
        content: reference.content,
      });

      refMessage = reference;
    } else {
      break;
    }
  }
  refMessages.reverse();
  messages.push(...refMessages);

  messages.push({ role: "user", content: message.content });

  const completion = await LLM.chat.completions.create({
    model: "deepseek-chat",
    messages,
    stream: false,
  });

  clearInterval(interval);

  message.reply({
    content: completion.choices[0].message.content ?? undefined,
  });
};
