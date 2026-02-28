import { useEffect, useRef, useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function Step3({ result, location, preview }) {
  const canvasRef = useRef(null)
  const [roast, setRoast] = useState('')
  const [loading, setLoading] = useState(false)
  const [storyReady, setStoryReady] = useState(false)
  const [storyDataUrl, setStoryDataUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { generateRoast() }, [])

  const generateRoast = async () => {
    setLoading(true)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const res = await model.generateContent(`
      Generate a funny Hindi-English Instagram story caption for this Mumbai civic issue.
      Issue: ${result.issueType}, Area: ${location.ward.name}, Ward: ${location.ward.ward}, Severity: ${result.severity}
      Rules:
      - Max 2 punchy lines
      - Funny sarcastic roast of BMC
      - Must end with: @mybmc #FixMumbai #${location.ward.name.replace(/ /g,'')} #NagrikAI
      - Hinglish tone
      Only return the caption, nothing else.
    `)
    const text = res.response.text().trim()
    setRoast(text)
    setLoading(false)
  }

  useEffect(() => { if (roast && preview) drawStory() }, [roast])

  const drawStory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 1080
    canvas.height = 1920

    const img = new Image()
    img.src = preview
    img.onload = () => {
      // Background
      ctx.fillStyle = '#0D0D0D'
      ctx.fillRect(0, 0, 1080, 1920)

      // Photo
      const imgAspect = img.width / img.height
      const drawW = 1080
      const drawH = drawW / imgAspect
      const drawY = (1920 - drawH) / 2
      ctx.drawImage(img, 0, drawY, drawW, drawH)

      // Top gradient
      const topGrad = ctx.createLinearGradient(0, 0, 0, 500)
      topGrad.addColorStop(0, 'rgba(0,0,0,0.9)')
      topGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, 1080, 500)

      // Bottom gradient
      const botGrad = ctx.createLinearGradient(0, 1200, 0, 1920)
      botGrad.addColorStop(0, 'rgba(0,0,0,0)')
      botGrad.addColorStop(1, 'rgba(0,0,0,0.95)')
      ctx.fillStyle = botGrad
      ctx.fillRect(0, 0, 1080, 1920)

      // TOP — Logo
      ctx.fillStyle = '#FF6B00'
      ctx.font = 'bold 80px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Nagrik', 60, 110)
      ctx.fillStyle = '#ffffff'
      ctx.fillText('AI', 340, 110)

      ctx.fillStyle = '#ffffff88'
      ctx.font = '32px Arial'
      ctx.fillText('Mumbai Civic Report • ' + new Date().toLocaleDateString('en-IN'), 60, 155)

      // Issue badge
      const badgeColor = result.severity === 'High' ? '#FF3B30' : result.severity === 'Medium' ? '#FF9500' : '#34C759'
      ctx.fillStyle = badgeColor
      ctx.beginPath()
      ctx.roundRect(60, 200, 500, 90, 45)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 44px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`⚠️  ${result.issueType}`, 310, 258)

      // Severity
      ctx.fillStyle = '#ffffff20'
      ctx.beginPath()
      ctx.roundRect(580, 200, 260, 90, 45)
      ctx.fill()
      ctx.fillStyle = badgeColor
      ctx.font = 'bold 40px Arial'
      ctx.fillText(`${result.severity} ⚡`, 710, 258)

      // Location block
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 52px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`📍 ${location.ward.name}`, 60, 1500)
      ctx.fillStyle = '#ffcc00'
      ctx.font = '38px Arial'
      ctx.fillText(`BMC Ward ${location.ward.ward} • Mumbai`, 60, 1556)

      // Roast
      ctx.fillStyle = '#ffffff'
      ctx.font = '42px Arial'
      ctx.textAlign = 'center'
      wrapText(ctx, roast, 540, 1640, 960, 58)

      // Bottom bar
      ctx.fillStyle = '#FF6B00'
      ctx.fillRect(0, 1840, 1080, 80)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('nagrik-ai-eta.vercel.app • Report. Share. Fix.', 540, 1893)

      setStoryDataUrl(canvas.toDataURL('image/jpeg', 0.95))
      setStoryReady(true)
    }
  }

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        ctx.fillText(line, x, y); line = words[i] + ' '; y += lineHeight
      } else { line = testLine }
    }
    ctx.fillText(line, x, y)
  }

  const downloadStory = () => {
    const a = document.createElement('a')
    a.href = storyDataUrl
    a.download = `NagrikAI-${location.ward.name}-${Date.now()}.jpg`
    a.click()
  }

  const copyCaption = () => {
    navigator.clipboard.writeText(roast)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .s3-wrap { padding: 0 20px 40px; font-family: 'DM Sans', sans-serif; }
        .s3-label { font-size: 11px; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; font-weight: 600; }
        .s3-loading { background: #1A1A1A; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 12px; }
        .s3-spinner { width: 36px; height: 36px; border: 3px solid #252525; border-top-color: #FF6B00; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .s3-loading-text { color: #666; font-size: 14px; }
        .s3-preview { border-radius: 20px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .s3-preview img { width: 100%; display: block; }
        .s3-roast { background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 16px; padding: 16px; margin-bottom: 12px; }
        .s3-roast-text { color: #ccc; font-size: 14px; line-height: 1.7; }
        .s3-btn { width: 100%; padding: 16px; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .s3-btn-orange { background: #FF6B00; color: #fff; }
        .s3-btn-orange:hover { background: #E55A00; }
        .s3-btn-dark { background: #1A1A1A; color: #fff; border: 1px solid #2A2A2A; }
        .s3-btn-dark:hover { border-color: #FF6B00; color: #FF6B00; }
        .s3-btn-ghost { background: transparent; color: #555; border: 1px solid #2A2A2A; }
        .s3-btn-ghost:hover { color: #fff; border-color: #444; }
      `}</style>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="s3-wrap">
        <div className="s3-label">Instagram Story</div>

        {loading && (
          <div className="s3-loading">
            <div className="s3-spinner" />
            <div className="s3-loading-text">Roast likh raha hoon... ✍️</div>
          </div>
        )}

        {storyReady && storyDataUrl && (
          <div className="s3-preview">
            <img src={storyDataUrl} alt="Story" />
          </div>
        )}

        {roast && (
          <div className="s3-roast">
            <div className="s3-roast-text">{roast}</div>
          </div>
        )}

        {storyReady && (
          <>
            <button className="s3-btn s3-btn-orange" onClick={downloadStory}>
              ⬇️ Story Download Karo
            </button>
            <button className="s3-btn s3-btn-dark" onClick={copyCaption}>
              {copied ? '✅ Copied!' : '📋 Caption Copy Karo'}
            </button>
            <button className="s3-btn s3-btn-ghost" onClick={() => window.dispatchEvent(new CustomEvent('restartApp'))}>
              🔄 Naya Issue Report Karo
            </button>
          </>
        )}
      </div>
    </>
  )
}