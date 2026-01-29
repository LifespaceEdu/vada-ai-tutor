'use client'
import { useState, useRef, useEffect } from 'react'

export default function VadaTutor() {
  const [hasCode, setHasCode] = useState(false)
  const [code, setCode] = useState('')
  const [assignmentInstructions, setAssignmentInstructions] = useState('')
  const [loadingCode, setLoadingCode] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('open')
  const chatBodyRef = useRef(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  const loadAssignment = async () => {
    if (!code.trim()) {
      alert('Please enter a code')
      return
    }

    setLoadingCode(true)
    try {
      const response = await fetch(
        `/api/get-assignment?code=${code.toUpperCase()}`
      )

      if (response.ok) {
        const data = await response.json()
        setAssignmentInstructions(data.instructions)
        setHasCode(true)
        setMessages([
          {
            role: 'assistant',
            content: "Hi! I'm ready to help you with this assignment. What questions do you have?",
          },
        ])
      } else {
        alert('Code not found. Check with your teacher.')
      }
    } catch (error) {
      console.error('Failed to load assignment:', error)
      alert('Failed to load assignment. Please try again.')
    } finally {
      setLoadingCode(false)
    }
  }

  const skipCode = () => {
    setHasCode(true)
    setMessages([
      {
        role: 'assistant',
        content: "Hi, I'm Vada. What are you curious about today?",
      },
    ])
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode,
          assignmentInstructions,
        }),
      })

      const data = await response.json()
      setMessages([...messages, userMessage, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Chat failed:', error)
      setMessages([
        ...messages,
        userMessage,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!hasCode) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1 className="header-title">Lifespace's Vada: AI Tutor</h1>
          </div>
          <div className="header-badge">Gentle Guided Inquiry</div>
        </header>

        <div className="content" style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
          <div className="section-card" style={{ maxWidth: '500px' }}>
            <div className="section-label">Welcome</div>
            <h2 className="section-title">Enter Your Assignment Code</h2>
            <div className="section-body" style={{ marginBottom: '20px' }}>
              Your teacher gave you a code to access your assignment. Enter it below, or skip to
              explore freely.
            </div>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && loadAssignment()}
              placeholder="Enter code (e.g. ABC123)"
              disabled={loadingCode}
              style={{
                width: '100%',
                background: '#020617',
                border: '1px solid rgba(51, 65, 85, 0.9)',
                borderRadius: '999px',
                padding: '12px 16px',
                color: 'var(--text)',
                fontSize: '1rem',
                textAlign: 'center',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            />

            <button
              onClick={loadAssignment}
              disabled={loadingCode}
              style={{
                width: '100%',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: '999px',
                padding: '12px',
                color: '#020617',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: loadingCode ? 'not-allowed' : 'pointer',
                marginBottom: '12px',
              }}
            >
              {loadingCode ? 'Loading...' : 'Start Assignment'}
            </button>

            <button
              onClick={skipCode}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid rgba(148, 163, 184, 0.4)',
                borderRadius: '999px',
                padding: '12px',
                color: 'var(--text-dim)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Skip - Explore Freely
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="header-title">Lifespace's Vada: AI Tutor</h1>
        </div>
        <div className="header-badge">Gentle Guided Inquiry</div>
      </header>

      <div className="layout">
        <nav className="nav">
          <div className="nav-title">Modes</div>
          <button
            className={`nav-item ${mode === 'open' ? 'active' : ''}`}
            onClick={() => setMode('open')}
          >
            Open Questions
          </button>
          <button
            className={`nav-item ${mode === 'planning' ? 'active' : ''}`}
            onClick={() => setMode('planning')}
          >
            Planning Help
          </button>
          <button
            className={`nav-item ${mode === 'deepen' ? 'active' : ''}`}
            onClick={() => setMode('deepen')}
          >
            Deepen Understanding
          </button>
        </nav>

        <main className="content">
          <div className="section-card">
            <div className="section-label">Welcome</div>
            <h2 className="section-title">A tutor that thinks with you.</h2>
            <div className="section-body">
              Vada will usually answer with a question first. It tries to understand what you
              already know, then adds short, clear ideas to help you move one step further.
            </div>
          </div>

          <div className="chat-container">
            <div className="chat-header">
              <div>
                <div className="chat-title">Vada</div>
                <div className="chat-subtitle">Ask something and explore it together.</div>
              </div>
            </div>

            <div className="chat-body" ref={chatBodyRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <span>{msg.content}</span>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <span>Thinking...</span>
                </div>
              )}
            </div>

            <div className="chat-input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask a question..."
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={loading}>
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
