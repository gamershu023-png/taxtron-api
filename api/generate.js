export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { topic, level } = req.body;

    console.log("Request received:", topic, level);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a JEE question generator."
          },
          {
            role: "user",
            content: `Generate 5 ${level || ""} questions on ${topic}.`
          }
        ]
      })
    });

    const data = await response.json();

    console.log("OpenAI response:", data);

    return res.status(200).json(data);

  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
