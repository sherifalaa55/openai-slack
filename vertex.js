const {VertexAI} = require('@google-cloud/vertexai');

const authOptions = {
    credentials: {
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


async function generateContent() {
  const req = {
    contents: [
      {role: 'user', parts: [{text: `Hello`}]}
    ],
  };

  const streamingResp = await generativeModel.generateContent(req);

//   for await (const item of streamingResp.stream) {
//     process.stdout.write('stream chunk: ' + JSON.stringify(item) + '\n');
//   }

  console.log(streamingResp, streamingResp.response.candidates[0].content.parts[0].text)
  process.stdout.write('aggregated response: ' + JSON.stringify(await streamingResp.response));
}

generateContent();
