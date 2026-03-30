import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. CORS Headers - Restrict to your Blogger URL for security
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error: API key missing" });
    }

    // 2. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Generate Content with basic error checking
    const result = await model.generateContent(topic);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("The AI returned an empty response. It might have been blocked by safety filters.");
    }

    res.status(200).json({ result: text });

  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({
      error: "Failed to generate content",
      details: err.message
    });
  }
}
