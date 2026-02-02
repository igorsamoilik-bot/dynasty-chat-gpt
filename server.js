import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Головна сторінка (щоб НЕ було Cannot GET /)
 */
app.get("/", (req, res) => {
  res.send("Dynasty ChatGPT працює");
});

/**
 * Основний маршрут для Creatium
 */
app.post("/reply", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Нема тексту відгуку" });
    }

    const prompt = `
Ти власник весільного салону Dynasty.
Напиши теплу, професійну, людську відповідь на відгук клієнта.
Без шаблонів, без AI-стилю.
Запропонуй поділитись фото або відео з події.

Відгук клієнта:
"${text}"
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    const answer =
      data.choices?.[0]?.message?.content || "Не вдалося згенерувати відповідь";

    res.json({ reply: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
