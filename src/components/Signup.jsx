import { useState } from 'react'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export default function Signup({ onComplete }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const validate = () => {
    if (!form.firstName.trim()) return 'First name daalo'
    if (!form.lastName.trim()) return 'Last name daalo'
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return 'Valid 10-digit mobile number daalo'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email daalo'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      // Check if already registered
      const q = query(collection(db, 'users'), where('mobile', '==', form.mobile))
      const existing = await getDocs(q)

      if (!existing.empty) {
        // Already exists — just login
        const userData = { id: existing.docs[0].id, ...existing.docs[0].data() }
        localStorage.setItem('nagrik_user', JSON.stringify(userData))
        onComplete(userData)
        return
      }

      // New user — save to Firestore
      const docRef = await addDoc(collection(db, 'users'), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobile: form.mobile,
        email: form.email.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
        reportsCount: 0
      })

      const userData = { id: docRef.id, ...form }
      localStorage.setItem('nagrik_user', JSON.stringify(userData))
      onComplete(userData)

    } catch (e) {
      setError('Kuch problem aayi — dobara try karo')
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0D0D; }

        .signup-wrap { max-width: 430px; margin: 0 auto; min-height: 100vh; background: #0D0D0D; color: #fff; font-family: 'DM Sans', sans-serif; padding: 40px 24px; display: flex; flex-direction: column; }

        .signup-logo { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .signup-logo span { color: #FF6B00; }
        .signup-tagline { font-size: 13px; color: #555; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 40px; }

        .signup-heading { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 6px; line-height: 1.2; }
        .signup-sub { font-size: 14px; color: #666; margin-bottom: 32px; line-height: 1.6; }

        .field-wrap { margin-bottom: 16px; }
        .field-label { font-size: 12px; color: #666; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600; }
        .field-row { display: flex; gap: 12px; }
        .field-input { width: 100%; background: #1A1A1A; border: 1.5px solid #2A2A2A; border-radius: 14px; padding: 14px 16px; color: #fff; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
        .field-input::placeholder { color: #444; }
        .field-input:focus { border-color: #FF6B00; }

        .error-msg { background: #FF3B3015; border: 1px solid #FF3B3040; color: #FF3B30; padding: 12px 16px; border-radius: 12px; font-size: 13px; margin-bottom: 16px; }

        .submit-btn { width: 100%; padding: 16px; background: #FF6B00; color: #fff; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .submit-btn:hover:not(:disabled) { background: #E55A00; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner { width: 20px; height: 20px; border: 2px solid #ffffff40; border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .privacy-note { font-size: 12px; color: #444; text-align: center; margin-top: 16px; line-height: 1.6; }

        .decorative { margin-top: auto; padding-top: 40px; }
        .deco-line { height: 1px; background: linear-gradient(90deg, transparent, #FF6B0040, transparent); margin-bottom: 16px; }
        .deco-text { font-size: 11px; color: #333; text-align: center; letter-spacing: 1px; }
      `}</style>

      <div className="signup-wrap">
        <div className="signup-logo">Nagrik<span>AI</span></div>
        <div className="signup-tagline">Mumbai ki awaaz • AI ki taakat</div>

        <div className="signup-heading">Mumbai ka<br />Asli Nagrik Bano 🇮🇳</div>
        <div className="signup-sub">Ek baar register karo — civic issues report karo, BMC ko jawab dene pe majboor karo.</div>

        <div className="field-wrap">
          <div className="field-label">Naam</div>
          <div className="field-row">
            <input className="field-input" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
            <input className="field-input" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
          </div>
        </div>

        <div className="field-wrap">
          <div className="field-label">Mobile Number</div>
          <input className="field-input" name="mobile" placeholder="9876543210" type="tel" maxLength={10} value={form.mobile} onChange={handleChange} />
        </div>

        <div className="field-wrap">
          <div className="field-label">Email</div>
          <input className="field-input" name="email" placeholder="tumhara@email.com" type="email" value={form.email} onChange={handleChange} />
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? <><div className="spinner" /> Saving...</> : '🚀 NagrikAI Join Karo'}
        </button>

        <div className="privacy-note">🔒 Tumhara data safe hai. Sirf civic reporting ke liye use hoga.</div>

        <div className="decorative">
          <div className="deco-line" />
          <div className="deco-text">REPORT • SHARE • FIX • MUMBAI</div>
        </div>
      </div>
    </>
  )
}