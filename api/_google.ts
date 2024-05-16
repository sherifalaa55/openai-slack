
import type { ConversationsRepliesResponse } from '@slack/web-api'
import { MessageElement } from '@slack/web-api/dist/types/response/ConversationsHistoryResponse';

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function getGPTResponse(history: any[], message: string) {
  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 100,
    },
  })
  return await chat.sendMessage(message);
}

export async function generatePromptFromThread(messages: MessageElement[]) {
  if (!messages) throw new Error('No messages found in thread')
  const botID = messages[0].reply_users?.[0]

  const result = messages
    .map((message: any) => {
      const isBot = !!message.bot_id && !message.client_msg_id
      const isNotMentioned = !isBot && !message.text.startsWith(`<@`)
      if (isNotMentioned) return null

      return {
        role: isBot ? 'model' : 'user',
        parts: isBot
          ? [{text: message.text}]
          : [{text: message.text.replace(`<@${botID}> `, '')}],
      }
    })
    .filter(Boolean)

  return result
}
