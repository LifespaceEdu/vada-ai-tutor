"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "What would you like to explore today? We can look at learning, community, or any question on your mind.",
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
        <div className="header-title">Indigenous-Centered Tutor</div>
        <div className="header-badge">Semi-Socratic</div>
      </header>

      <div className="layout">
        <aside className="nav">
          <div className="nav-title">Spaces</div>
          <button className="nav-item active">Open Inquiry</button>
          <button className="nav-item">Learning Planning</button>
          <button className="nav-item">Decolonizing the Topic</button>
        </aside>

        <section className="content">
          <div className="section-card">
            <div className="section-label">Conversation</div>
            <h1 className="section-title">
              Ask, reflect, connect to your lived world.
            </h1>
            <p className="section-body">
              This tutor will often answer with a question first, bringing in
              perspectives from Indigenous and other marginalized communities
              when they can deepen understanding.
            </p>
          </div>

          <div className="chat-container">
            <div className="chat-header">
              <div>
                <div className="chat-title">Tutor</div>
                <div className="chat-subtitle">
                  Centering voices outside the usual canon
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
                placeholder="Ask anything, or say how you’re feeling about learning…"
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

