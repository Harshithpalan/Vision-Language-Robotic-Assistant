import { useState, useEffect, useRef, useCallback } from 'react'
import CameraFeed from './components/CameraFeed'
import ChatInterface from './components/ChatInterface'

export default function App() {
  const [messages, setMessages] = useState([])
  const [robotStatus, setRobotStatus] = useState({
    position: [0, 0, 0],
    state: 'idle',
    battery: 100
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wsRef = useRef(null)

  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setIsConnected(true)
        setMessages(prev => [...prev, {
          role: 'system',
          content: 'Connected to robotic assistant. Ready for commands.'
        }])
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'response') {
          setIsLoading(false)
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.text
          }])
          if (data.robot_status) {
            setRobotStatus(data.robot_status)
          }
        } else if (data.type === 'status_update') {
          setRobotStatus(data.robot_status)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = () => {
        setIsConnected(false)
      }

      wsRef.current = ws
    } catch (err) {
      console.error('WebSocket connection failed:', err)
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connectWebSocket])

  const sendCommand = useCallback((text, image = null) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Not connected. Please wait for reconnection...'
      }])
      return
    }

    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      image: image
    }])

    setIsLoading(true)

    wsRef.current.send(JSON.stringify({
      type: 'command',
      text: text,
      image: image
    }))
  }, [])

  const handleCapture = useCallback((imageData) => {
    if (imageData) {
      sendCommand('Analyze this camera frame', imageData)
    }
  }, [sendCommand])

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="header-icon">🤖</div>
          <h1>VLM Robotic Assistant</h1>
        </div>
        <div className="header-status">
          <span className="status-dot" style={{
            background: isConnected ? 'var(--success)' : 'var(--error)'
          }} />
          {isConnected ? 'System Online' : 'Reconnecting...'}
        </div>
      </header>

      <div className="main-view">
        <CameraFeed onCapture={handleCapture} />
      </div>

      <aside className="sidebar">
        <div className="robot-panel">
          <h3>Robot Status</h3>
          <div className="robot-stats">
            <div className="stat-card">
              <div className="stat-label">State</div>
              <div className="stat-value">{robotStatus.state}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Battery</div>
              <div className="stat-value">{robotStatus.battery}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">X</div>
              <div className="stat-value">{robotStatus.position[0].toFixed(1)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Y</div>
              <div className="stat-value">{robotStatus.position[1].toFixed(1)}</div>
            </div>
          </div>
        </div>

        <ChatInterface
          messages={messages}
          onSend={sendCommand}
          isConnected={isConnected}
          isLoading={isLoading}
        />
      </aside>
    </div>
  )
}
