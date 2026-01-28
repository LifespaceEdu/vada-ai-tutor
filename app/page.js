"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m Vada. What are you curious about today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "I’m having trouble reaching the model right now.";

      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Something went wrong reaching the model. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div className="header-title">Lifespace’s Vada: AI Tutor</div>
        <div className="header-badge">Gentle Guided Inquiry</div>
      </header>

      <div className="layout">
        <aside className="nav">
          <div className="nav-title">Modes</div>
          <button className="nav-item active">Open Questions</button>
          <button className="nav-item">Planning Help</button>
          <button className="nav-item">Deepen Understanding</button>
        </aside>

        <section className="content">
          <div className="section-card">
            <div className="section-label">Welcome</div>
            <h1 className="section-title">
              A tutor that thinks with you.
            </h1>
            <p className="section-body">
              Vada will usually answer with a question first. It tries to
              understand what you already know, then adds short, clear ideas
              to help you move one step further.
            </p>
          </div>

          <div className="chat-container">
            <div className="chat-header">
              <div>
                <div className="chat-title">Vada</div>
                <div className="chat-subtitle">
                  Ask something and explore it together.
                </div>
              </div>
            </div>

            <div className="chat-body">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`message ${m.role === "user" ? "user" : "assistant"}`}
                >
                  <span>{m.content}</span>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <span>Thinking with you…</span>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="chat-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What would you like to talk about?"
              />
              <button type="submit" disabled={loading}>
                Send
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
