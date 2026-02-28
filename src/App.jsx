import { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import MapView from './components/MapView'
import Step3 from './components/Step3'
import Signup from './components/Signup'
import { detectWard } from './data/wardData'
import 'leaflet/dist/leaflet.css'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function App() {
  const [user, setUser] = useState(null)
  const [result, setResult] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState(1)

  useEffect(() => {
    // Check if user already registered
    const saved = localStorage.getItem('nagrik_user')
    if (saved) setUser(JSON.parse(saved))

    navigator.geolocation.watchPosition(
      (pos) => {
        const ward = detectWard(pos.coords.latitude, pos.coords.longitude)
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, ward })
      },
      () => {
        const ward = detectWard(19.0760, 72.8777)
        setLocation({ lat: 19.0760, lng: 72.8777, ward })
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )

    window.addEventListener('restartApp', () => {
      setStep(1); setResult(null); setPreview(null)
    })
  }, [])

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1]
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const res = await model.generateContent([
        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
        `You are a Mumbai civic issue detector. Analyze this image and reply ONLY in JSON:
        {"issueType":"Pothole/Garbage/Broken Streetlight/Waterlogging/Other","severity":"Low/Medium/High","description":"one line description in English"}`
      ])
      const text = res.response.text()
      const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
      setResult(JSON.parse(clean))
      setLoading(false)
      setStep(2)
    }
  }

  const severityColor = (s) => s === 'High' ? '#FF3B30' : s === 'Medium' ? '#FF9500' : '#34C759'
  const severityBg = (s) => s === 'High' ? '#FF3B3020' : s === 'Medium' ? '#FF950020' : '#34C75920'
  const issueIcon = (type) => {
    if (type === 'Pothole') return '🕳️'
    if (type === 'Garbage') return '🗑️'
    if (type === 'Broken Streetlight') return '💡'
    if (type === 'Waterlogging') return '🌊'
    return '⚠️'
  }

  // Show signup if not registered
  if (!user) return <Signup onComplete={(u) => setUser(u)} />

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; min-height: 100vh; }
        .app { max-width: 430px; margin: 0 auto; min-height: 100vh; background: #0D0D0D; color: #fff; font-family: 'DM Sans', sans-serif; }

        .header { padding: 20px 20px 0; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; letter-spacing: -1px; }
        .logo span { color: #FF6B00; }
        .user-chip { background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 100px; padding: 6px 12px; display: flex; align-items: center; gap: 8px; }
        .user-avatar { width: 28px; height: 28px; background: #FF6B00; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
        .user-name { font-size: 13px; font-weight: 600; color: #ccc; }

        .step-indicator { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; }
        .step-dot { width: 6px; height: 6px; border-radius: 3px; background: #2A2A2A; transition: all 0.3s; }
        .step-dot.active { width: 20px; background: #FF6B00; }
        .step-dot.done { background: #34C759; }

        .location-bar { margin: 12px 20px; background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 8px; }
        .location-dot { width: 8px; height: 8px; border-radius: 50%; background: #34C759; animation: pulse 2s infinite; flex-shrink: 0; }
        .location-dot.loading { background: #FF9500; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
        .location-text { font-size: 13px; color: #999; flex: 1; }
        .location-text strong { color: #fff; }
        .ward-badge { background: #FF6B0020; border: 1px solid #FF6B0050; color: #FF6B00; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }

        .hero { padding: 12px 20px 20px; }
        .upload-card { background: #1A1A1A; border: 2px dashed #2A2A2A; border-radius: 24px; padding: 40px 20px; text-align: center; position: relative; overflow: hidden; }
        .upload-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, #FF6B0008 0%, transparent 60%); pointer-events: none; }
        .upload-icon { font-size: 52px; margin-bottom: 12px; display: block; }
        .upload-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 6px; }
        .upload-sub { font-size: 13px; color: #666; margin-bottom: 20px; line-height: 1.5; }
        .upload-btn-label { display: inline-block; background: #FF6B00; color: #fff; padding: 14px 28px; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; position: relative; transition: all 0.2s; }
        .upload-btn-label:hover { background: #E55A00; }
        .upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .preview-img { width: 100%; border-radius: 16px; margin-top: 16px; display: block; }
        .loading-overlay { text-align: center; padding: 20px 0 0; }
        .loading-spinner { display: inline-flex; align-items: center; gap: 10px; background: #252525; border: 1px solid #333; padding: 12px 20px; border-radius: 100px; }
        .spinner { width: 18px; height: 18px; border: 2px solid #333; border-top-color: #FF6B00; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: 14px; color: #999; }

        .result-section { padding: 0 20px 20px; }
        .section-label { font-size: 11px; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; font-weight: 600; }
        .issue-card { background: #1A1A1A; border-radius: 20px; overflow: hidden; margin-bottom: 12px; }
        .issue-header { padding: 18px; display: flex; align-items: flex-start; gap: 14px; }
        .issue-icon-wrap { width: 52px; height: 52px; border-radius: 14px; background: #252525; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
        .issue-info { flex: 1; }
        .issue-type { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 4px; }
        .issue-desc { font-size: 13px; color: #888; line-height: 1.5; }
        .severity-tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; margin-top: 10px; }
        .divider { height: 1px; background: #252525; }
        .location-info { padding: 14px 18px; display: flex; align-items: center; gap: 12px; }
        .loc-icon { font-size: 20px; }
        .loc-details { flex: 1; }
        .loc-area { font-size: 14px; font-weight: 600; }
        .loc-ward { font-size: 12px; color: #666; margin-top: 2px; }
        .loc-covers { font-size: 11px; color: #444; margin-top: 3px; }
        .map-wrap { margin: 0 20px 12px; border-radius: 20px; overflow: hidden; }
        .action-btn { margin: 0 20px 12px; width: calc(100% - 40px); padding: 16px; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; background: #FF6B00; color: #fff; }
        .action-btn:hover { background: #E55A00; transform: translateY(-1px); }

        .welcome-bar { margin: 0 20px 4px; padding: 10px 14px; background: #FF6B0010; border: 1px solid #FF6B0030; border-radius: 10px; font-size: 13px; color: #FF6B00; }
      `}</style>

      <div className="app">
        {/* Header */}
        <div className="header">
          <div>
            <div className="logo">Nagrik<span>AI</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`} />
              <div className={`step-dot ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`} />
              <div className={`step-dot ${step >= 3 ? 'active' : ''}`} />
            </div>
            <div className="user-chip">
              <div className="user-avatar">{user.firstName[0]}</div>
              <div className="user-name">{user.firstName}</div>
            </div>
          </div>
        </div>

        {/* Welcome */}
        {step === 1 && (
          <div className="welcome-bar">
            👋 Jai hind, {user.firstName}! Koi issue dikhe toh report karo.
          </div>
        )}

        {/* Location Bar */}
        <div className="location-bar">
          <div className={`location-dot ${!location ? 'loading' : ''}`} />
          <div className="location-text">
            {location ? <><strong>{location.ward.name}</strong>, Mumbai</> : 'Location detect ho rahi hai...'}
          </div>
          {location && <div className="ward-badge">Ward {location.ward.ward}</div>}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="hero">
            <div className="upload-card">
              <span className="upload-icon">📸</span>
              <div className="upload-title">Issue Report Karo</div>
              <div className="upload-sub">Photo lo — AI classify karega,<br />BMC ko alert jayega</div>
              <label className="upload-btn-label">
                📷 Camera Kholo
                <input className="upload-input" type="file" accept="image/*" capture="environment" onChange={handlePhoto} />
              </label>
              {preview && <img src={preview} className="preview-img" />}
              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner">
                    <div className="spinner" />
                    <span className="loading-text">AI analyze kar raha hai...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && result && location && (
          <div className="result-section">
            <div className="section-label">AI Detection</div>
            <div className="issue-card">
              <div className="issue-header">
                <div className="issue-icon-wrap">{issueIcon(result.issueType)}</div>
                <div className="issue-info">
                  <div className="issue-type">{result.issueType}</div>
                  <div className="issue-desc">{result.description}</div>
                  <div className="severity-tag" style={{ background: severityBg(result.severity), color: severityColor(result.severity) }}>
                    ● {result.severity} Severity
                  </div>
                </div>
              </div>
              <div className="divider" />
              <div className="location-info">
                <div className="loc-icon">📍</div>
                <div className="loc-details">
                  <div className="loc-area">{location.ward.name}, Mumbai</div>
                  <div className="loc-ward">BMC Ward {location.ward.ward}</div>
                  <div className="loc-covers">{location.ward.areas.slice(0, 4).join(' · ')}</div>
                </div>
              </div>
            </div>

            <div className="section-label">Location</div>
            <div className="map-wrap">
              <MapView location={location} result={result} />
            </div>

            <button className="action-btn" onClick={() => setStep(3)}>
              📱 Instagram Story Banao →
            </button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && result && location && (
          <Step3 result={result} location={location} preview={preview} user={user} />
        )}
      </div>
    </>
  )
}