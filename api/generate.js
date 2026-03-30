import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

  // CORS (for Blogger)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key missing" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use a stable model alias
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const result = await model.generateContent(topic);
    const text = result.response.text();

    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
}
