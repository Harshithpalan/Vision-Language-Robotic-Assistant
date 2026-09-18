import { useState, useRef, useEffect, useCallback } from 'react'

export default function CameraFeed({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsActive(true)
      setError(null)
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div className="camera-section">
      {isActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-feed"
        />
      ) : (
        <div className="camera-placeholder">
          <div className="camera-placeholder-icon">📷</div>
          <p>Camera feed will appear here</p>
          {error && <p style={{ color: 'var(--error)', fontSize: '13px' }}>{error}</p>}
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="camera-controls">
        <button
          onClick={isActive ? stopCamera : startCamera}
          className={isActive ? 'active' : ''}
        >
          {isActive ? '⏹ Stop Camera' : '▶ Start Camera'}
        </button>
        {isActive && (
          <button onClick={() => onCapture?.(captureFrame())}>
            📸 Capture Frame
          </button>
        )}
      </div>
    </div>
  )
}
