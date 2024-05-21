import { MessageElement } from '@slack/web-api/dist/types/response/ConversationsHistoryResponse';
const {VertexAI} = require('@google-cloud/vertexai');

const authOptions = {
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDJ8wsNLMaPZZv/\nkzy9mNcU4IaQJl7yfxUYWFZyhngsLh/VSTm80x0GVLK+hPwl14dlA4xHLWHx78k4\nLio74BHh3Z8eo5TycvHd2fQK5ID+Y45wdfmn6QyiCcZUiVRZh/5J7zFaHHGRnmQc\nmE3veSdyM6SzrH49qd6aU09XbMEZZZ9eT7fpxDcGePPgf4aFS3VmcUIfvqafSBPq\nlcP55jxSZTUTjew+ngKK+a3rK9cAVQT6AABuNn8wm3RrO5zp5v8zQRNsNVstP8ma\n+sHzO0aSiaFoa7jZU41Naooc4Glt7Lqv3NysbEsZzxVdlglzcjC9pybAfpyCcFbi\noh/2LjoTAgMBAAECggEAWk25d+M5SN8FUlQLGbbyGm5KDcRyuZn1G2VJBr41l3/q\nkSvEyzhV5sJSCVqbC+rkKtnazOswvIheYKZYEV0hce/xmrhIPuACYpN3CrXiLp7j\nD0vZ3ukZ0o1vZ9be5ogmv/XbCjHk4NpEZvr+AqMY7frE3+k2rCk9FqJBPNUvRcS8\npEgakOwGe1981mcRb6J5xyDRN3N8NDRtL+79p+ZwYI6wAPa5ng0VIRps70cu5u0P\nNzkIuLTz+H7jTmDpyJ4KnpSeQfqUc44seO1jSACcGPcAVlQszMT5STL32ufQ2Zww\nphBxEgV6Ccc75APBkXikUG+J5PSY1Bk4jECD1FOukQKBgQD6VEdVEf73jFN2IiMo\nz3GPRrgiiFOrMg8Cs5r5iSTIK/g+wGGZp+Hb7RwqqA1d6aXSaE7y++vy/L5V7tug\nmhSEHozon9xAzlT2fPTUG2gUWFQyO2Nndb184Z51dz6a0cOfvcQnQf0/X6LAgMHe\n5TViKJ9qd2OeiuHcLrj4bKh0gwKBgQDOhjKoqECrT065vqich8a2R0FNrY5xWuYg\n3r+5ePq4vMXXdfk+vTw2bSjg414VcyjLmb978eB99a9s0vOAaSOuHOrhIWGlocT6\nROkl37kO+6yh+8FNEdu2WOHqKsTuN0Xxhhf3B2TYtZbIFR6UUuUgKbKZpiyXe+v2\nLiAFlD7PMQKBgFiEUKzuLiBOyHxvWctmfxtQwG/FkQBqNRCZfeVa71yw35kg4eI5\nkQ35bApRXlik8/PQ2onlNuu3H363dYX2teZ5/w2K6ZEo5LY8PT57anQ3P557jYzZ\n/2UXSrbysXqBThFAQwo2tVwhbyVu4h71IclR3/z/toQrS+5VvyZpFbANAoGAOKdD\nmlSdeOEGnZmZs2bjsfkWBvMHUj03R+kS+xQe4zKVqydnujg7HksPnbGBi6zNkhyZ\nFK0jgio1d0rfFWjCKu8v15ZKrR8VY/onYwZeQ6fykXT4b+XoObtkLdKRty9edoTs\nag2TMoeN11FD1DhxNkN6BQA610tdTWkVy7IBEOECgYB7sRibqfxglmwF2cQXkjg0\nOf8Y8vsGKfR8vbTrLo5XRTRfkRXAwDuuVBQ2IDIiuW4ROmkV8OWXfDUzkO7jd+gM\nWEEe0J3Jgh8oexEj3hxurTHCIoN2k0hAvFANUBQo24Tuokjg5kcdR5l8qGg8SxAw\nBOBVbtL3eNhZaQIMYCfScw==\n-----END PRIVATE KEY-----\n",
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
  .filter((message: any) => {
    return message.parts[0].text.indexOf("Error: ") === -1;
  })

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
