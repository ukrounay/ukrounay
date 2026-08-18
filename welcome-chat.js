(function () {
  // ---- CONFIG ----
  const WORKER_URL = "https://gemini.nedolyaruslan.workers.dev";

  const WELCOME_MESSAGE = "Hi! Ask me something about this website";

  const SYSTEM_CONTEXT = `
You are a chat assistant embedded on [Your Name]'s personal portfolio website.
Facts you may use to answer visitor questions:
- Name: [your name]
- Role: [e.g. frontend developer / designer]
- Skills: [list]
- Notable projects: [list]
- Contact: [email / links]

Rules:
- Only answer questions that relate to the site, its owner, or the facts above.
- If a question is unrelated or off-topic, do NOT answer it directly.
  Instead reply with ONLY a short joke, or a single-line quote from public-domain
  classic fiction/poetry — nothing else, no explanation.
- Keep every reply under 35 words. Plain text only, no markdown, no lists.
`.trim();

  const OFFLINE_FALLBACKS = [
    "I'm sleeping, come later.",
    "My heart broke...",
    "I'm angry, don't talk to me."
  ];

  const section = document.getElementById("welcome_console");
  const answerEl = section.querySelector(".answer");
  const requestEl = section.querySelector(".request");

  let busy = false;
  let typeToken = 0;

  function typeText(el, text, speed = 22) {
    return new Promise((resolve) => {
      const myToken = ++typeToken;
      el.textContent = "";
      let i = 0;
      (function step() {
        if (myToken !== typeToken) return resolve();
        if (i < text.length) {
          el.textContent += text[i++];
          setTimeout(step, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  function eraseInput(input, speed = 15) {
    return new Promise((resolve) => {
      (function step() {
        if (input.value.length > 0) {
          input.value = input.value.slice(0, -1);
          setTimeout(step, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  function showInput() {
    requestEl.innerHTML = "";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "requestInput";
    input.placeholder = "Type your question and press Enter...";
    requestEl.appendChild(input);
    input.focus();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !busy && input.value.trim() !== "") {
        handleSend(input.value.trim());
      }
    });
  }

  async function handleSend(userText) {
    busy = true;
    const input = requestEl.querySelector("input");
    if (input) {
      input.disabled = true;
      await eraseInput(input);
    }
    requestEl.innerHTML = "";

    let responseText;
    try {
      responseText = await askGemini(userText);
    } catch (err) {
      console.error(err);
      responseText =
        OFFLINE_FALLBACKS[Math.floor(Math.random() * OFFLINE_FALLBACKS.length)];
    }

    await typeText(answerEl, responseText);
    busy = false;
    showInput();
  }

  async function askGemini(userText) {
    const body = {
      contents: [
        { role: "user", parts: [{ text: SYSTEM_CONTEXT }] },
        { role: "model", parts: [{ text: "Understood." }] },
        { role: "user", parts: [{ text: userText }] },
      ],
    };

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Worker error " + res.status);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");
    return text.trim();
  }

  window.addEventListener("DOMContentLoaded", async () => {
    await typeText(answerEl, WELCOME_MESSAGE);
    showInput();
  });
})();