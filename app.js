const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const prompt = "Hello";

const result = model.generateContent([prompt]).then((res) => {{
    console.log(res.response.text());
}});
// console.log(result.response.text());