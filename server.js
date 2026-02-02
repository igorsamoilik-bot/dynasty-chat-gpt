import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 1️⃣ Головна сторінка — щоб НЕ було "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Dynasty ChatGPT server is running");
});

// 2️⃣ Основний endpoint для відповіді
app.post("/reply", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

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
            content:
              "Ти власник весільного салону Dynasty. Напиши теплу, живу, людську відповідь на відгук клієнта українською."
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
