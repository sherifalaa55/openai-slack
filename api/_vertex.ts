import { MessageElement } from '@slack/web-api/dist/types/response/ConversationsHistoryResponse';
const {VertexAI} = require('@google-cloud/vertexai');

const authOptions = {
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY,
  },
};

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: 'peaceful-system-412717', location: 'us-central1', googleAuthOptions: authOptions});
const model = 'gemini-1.5-flash-preview-0514';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 8192,
    'temperature': 1,
    'topP': 0.95,
  },
  systemInstruction: {
    parts: [{"text": `you are an ecommerce manager tasked with helping the user manage their ecommrece`}]
  },
});

export async function getGPTResponse(history: any[], message: string) {
  const req = {
    contents: history,
  };

  return await generativeModel.generateContent(req);
}

export async function generatePromptFromThread(messages: MessageElement[]) {
  if (!messages) throw new Error('No messages found in thread')
  const botID = messages[0].reply_users?.[0]
  console.log(messages);
  messages = messages.reverse();
  
  const result = messages
  .map((message: any) => {
    const isBot = !!message.bot_id && !message.client_msg_id
    
    return {
      role: isBot ? 'model' : 'user',
      parts: isBot
      ? [{text: message.text}]
      : [{text: message.text.replace(`<@${botID}> `, '')}],
    }
  })
  .filter(Boolean)

  let filteredMessage = [result[0]];
  let lastRole = result[0].role
  for (let i = 1; i < result.length; i++) {
    if (result[i].role != lastRole) {
      filteredMessage.push(result[i]);
      lastRole = result[i].role
    }
  }
  
  return filteredMessage
}
