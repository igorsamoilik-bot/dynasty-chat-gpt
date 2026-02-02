import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* UI */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<title>Відповідь на відгук — Dynasty</title>
<style>
body { font-family: Arial; padding: 30px; background:#f7f7f7 }
textarea { width:100%; min-height:120px }
button { margin-top:10px; padding:10px; background:black; color:white; border:none }
#result { background:#fff; padding:15px; margin-top:15px }
</style>
</head>
<body>

<h3>Встав відгук клієнта</h3>
<textarea id="text"></textarea>
<button onclick="generate()">Згенерувати відповідь</button>

<h3>Готова відповідь від Dynasty</h3>
<div id="result">Очікування…</div>

<script>
async function generate() {
  const text = document.getElementById("text").value;
  const result = document.getElementById("result");
  result.innerText = "Генеруємо...";

  try {
    const r = await fetch("/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const d = await r.json();
    result.innerText = d.reply || d.error || "Помилка генерації";
  } catch (e) {
    result.innerText = "Помилка зʼєднання";
  }
}
</script>

</body>
</html>
  `);
});

/* API */
app.post("/reply", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      console.error("NO OPENAI KEY");
      return res.json({ error: "OPENAI_API_KEY не заданий" });
    }

    const { text } = req.body;
    if (!text) return res.json({ error: "Порожній текст" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ти власник весільного салону Dynasty. Напиши теплу відповідь українською мовою."
          },
          { role: "user", content: text }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    if (!data.choices) {
      return res.json({ error: "OpenAI error" });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (e) {
    console.error("SERVER ERROR:", e);
    res.json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log("Server started"));
