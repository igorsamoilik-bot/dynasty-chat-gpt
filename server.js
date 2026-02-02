import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* Головна сторінка (UI) */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<title>Відповідь на відгук — Dynasty</title>
<style>
body {
  font-family: Arial, sans-serif;
  background:#f7f7f7;
  padding:30px;
}
textarea {
  width:100%;
  min-height:120px;
  margin-bottom:10px;
}
button {
  padding:10px 16px;
  background:black;
  color:white;
  border:none;
  cursor:pointer;
}
#result {
  margin-top:15px;
  background:#fff;
  padding:15px;
  min-height:80px;
}
</style>
</head>
<body>

<h3>Встав відгук клієнта</h3>
<textarea id="text" placeholder="Встав текст відгуку..."></textarea>
<button onclick="generate()">Згенерувати відповідь</button>

<h3>Готова відповідь від Dynasty</h3>
<div id="result">Тут зʼявиться відповідь</div>

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

    const data = await r.json();
    result.innerText = data.reply || "Помилка генерації";
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
    const { text } = req.body;

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
            content: "Ти власник весільного салону Dynasty. Напиши теплу, ввічливу відповідь на відгук клієнта українською мовою."
          },
          { role: "user", content: text }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: "OpenAI error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
