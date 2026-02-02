import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* 🟢 ТЕСТ: головна сторінка */
app.get("/", (req, res) => {
  res.send("Dynasty ChatGPT server is running ✅");
});

/* 🟢 ОСНОВНИЙ API ДЛЯ CREATIUM */
app.post("/reply", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ти власник весільного салону Dynasty у Дніпрі. Відповідай тепло, ввічливо, по-людськи, без пафосу. Дякуй клієнту, запрошуй на фото або відео з весілля."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const answer =
      data.choices?.[0]?.message?.content ||
      "Не вдалося згенерувати відповідь";

    res.json({ answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
