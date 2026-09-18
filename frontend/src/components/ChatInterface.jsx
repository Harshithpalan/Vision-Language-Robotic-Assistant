import { useState, useRef, useEffect } from 'react'

export default function ChatInterface({ messages, onSend, isConnected, isLoading }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input.trim())
      setInput('')
    }
  }

  return (
    <div className="chat-section">
      <div className="chat-header">
        <h3>Command Interface</h3>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot" style={{
            background: isConnected ? 'var(--success)' : 'var(--error)'
          }} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <h4>Ready for commands</h4>
            <p>Type a command or capture a camera frame to begin interacting with the robotic assistant.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.image && (
                <img src={msg.image} alt="Captured" className="message-image" />
              )}
              {msg.content}
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!input.trim() || isLoading || !isConnected}>
          Send ➤
        </button>
      </form>
    </div>
  )
}
