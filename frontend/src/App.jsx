import { useState } from 'react'
import './App.css'

export default function App() {
  const [file, setFile]           = useState(null)
  const [status, setStatus]       = useState('idle')   // 'idle' | 'uploading' | 'ready' | 'error'
  const [sessionId, setSessionId] = useState(null)
  const [uploadMeta, setUploadMeta] = useState(null)   // { pages, figures_found }
  const [error, setError]         = useState(null)

  function handleFileChange(e) {
    setFile(e.target.files[0])
    setStatus('idle')
    setError(null)
  }

  async function handleUpload() {
    if (!file) return

    setStatus('uploading')
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/upload', { method: 'POST', body: formData })

      if (!res.ok) {
        let detail = `Server error ${res.status}`
        try {
          const body = await res.json()
          detail = body.detail ?? detail
        } catch {}
        throw new Error(detail)
      }

      const data = await res.json()
      setSessionId(data.session_id)
      setUploadMeta({ pages: data.pages, figures: data.figures_found })
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Paper Buddy</h1>
        <p>Upload a research paper and get a structured breakdown instantly.</p>
      </header>

      <main>
        {status !== 'ready' && (
          <div className="upload-card">
            <label className="file-label">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              {file ? file.name : 'Choose a PDF…'}
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className="upload-btn"
            >
              {status === 'uploading' ? 'Uploading…' : 'Upload'}
            </button>

            {status === 'error' && (
              <p className="error-msg">{error}</p>
            )}
          </div>
        )}

        {status === 'ready' && (
          <div className="ready-card">
            <p className="ready-title">Ready to analyze</p>
            <p className="ready-meta">
              {uploadMeta.pages} pages · {uploadMeta.figures} figures found
            </p>
            <p className="ready-file">{file.name}</p>
            <button className="analyze-btn">
              Analyze paper →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
