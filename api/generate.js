import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { topic, image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("API Key is missing in Vercel settings.");
    if (!topic && !image) throw new Error("Topic/Prompt or image is required.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const parts = [];

    if (image) {
      const base64Data = image.includes(",") ? image.split(",")[1] : image;
      const mimeTypeMatch = image.match(/^data:(image\/[a-zA-Z]+);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/png";

      parts.push({
        inlineData: { data: base64Data, mimeType }
      });
    }

    if (topic) {
      parts.push({ text: topic });
    }

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const text = result.response.text();

    res.status(200).json({ result: text });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "[GoogleGenerativeAI Error]: " + err.message });
  }
}
