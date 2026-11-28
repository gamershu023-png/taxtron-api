import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { topic, image } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "API Key is missing in Vercel settings." });
    if (!topic && !image) return res.status(400).json({ error: "Topic/Prompt or image is required." });

    const parts = [];
    if (image) {
      const base64Data = image.includes(",") ? image.split(",")[1] : image;
      const mimeTypeMatch = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/png";
      parts.push({ inlineData: { data: base64Data, mimeType } });
    }
    if (topic) parts.push({ text: topic });

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastErr = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({ contents: [{ role: "user", parts }] });
        const text = result.response.text();
        return res.status(200).json({ result: text, model: modelName });
      } catch (err) {
        lastErr = err;
        // Retry on 503 (overloaded) or 429 (rate limit); otherwise throw immediately
        if (err.status !== 503 && err.status !== 429) throw err;
      }
    }

    throw lastErr;
  } catch (err) {
    console.error("Server Error:", err);
    const status = err.status || 500;
    return res.status(status).json({ error: "[GoogleGenerativeAI Error]: " + err.message });
  }
}
