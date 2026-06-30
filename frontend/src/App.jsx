import { useState } from 'react'
import './App.css'

export default function App() {
  const [file, setFile]             = useState(null)
  const [status, setStatus]         = useState('idle')  // 'idle'|'uploading'|'ready'|'analyzing'|'analyzed'|'error'
  const [sessionId, setSessionId]   = useState(null)
  const [uploadMeta, setUploadMeta] = useState(null)
  const [analysis, setAnalysis]     = useState(null)
  const [error, setError]           = useState(null)

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
        try { const body = await res.json(); detail = body.detail ?? detail } catch {}
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

  async function handleAnalyze() {
    setStatus('analyzing')
    setError(null)

    try {
      const res = await fetch(`/analyze/${sessionId}`)
      if (!res.ok) {
        let detail = `Server error ${res.status}`
        try { const body = await res.json(); detail = body.detail ?? detail } catch {}
        throw new Error(detail)
      }
      const data = await res.json()
      setAnalysis(data)
      setStatus('analyzed')
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
        {(status === 'idle' || status === 'uploading' || status === 'error') && (
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

            {status === 'error' && <p className="error-msg">{error}</p>}
          </div>
        )}

        {(status === 'ready' || status === 'analyzing') && (
          <div className="ready-card">
            <p className="ready-title">Ready to analyze</p>
            <p className="ready-meta">
              {uploadMeta.pages} pages · {uploadMeta.figures} figures found
            </p>
            <p className="ready-file">{file.name}</p>
            <button
              onClick={handleAnalyze}
              disabled={status === 'analyzing'}
              className="analyze-btn"
            >
              {status === 'analyzing' ? 'Analyzing… (this takes ~10s)' : 'Analyze paper →'}
            </button>
          </div>
        )}

        {status === 'analyzed' && <AnalysisView data={analysis} filename={file.name} />}
      </main>
    </div>
  )
}

function AnalysisView({ data, filename }) {
  return (
    <div className="analysis">
      <p className="analysis-filename">{filename}</p>

      <section className="card">
        <h2>Key Ideas</h2>
        <div className="key-ideas">
          <div>
            <span className="idea-label">Problem</span>
            <p>{data.key_ideas.problem}</p>
          </div>
          <div>
            <span className="idea-label">Core Insight</span>
            <p>{data.key_ideas.core_insight}</p>
          </div>
          <div>
            <span className="idea-label">Methodology</span>
            <p>{data.key_ideas.methodology}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Key Terms</h2>
        <ul className="term-list">
          {data.key_terms.map((t) => (
            <li key={t.term} className="term-item">
              <div className="term-header">
                <span className="term-name">{t.term}</span>
                {t.term !== t.full_name && (
                  <span className="term-full">{t.full_name}</span>
                )}
                {t.defined_by_paper && (
                  <span className="term-badge">defined here</span>
                )}
              </div>
              <p className="term-def">{t.definition}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Section Importance</h2>
        <ul className="section-list">
          {data.section_importance.map((s) => (
            <li key={s.section} className="section-item">
              <div className="section-header">
                <span className="section-name">{s.section}</span>
                <span className={`importance-badge ${s.importance}`}>{s.importance}</span>
              </div>
              <p className="section-reason">{s.reason}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>References</h2>
        <ul className="ref-list">
          {data.references.map((r) => (
            <li key={r.title} className="ref-item">
              <span className="ref-title">{r.title}</span>
              <p className="ref-why">{r.why_it_matters}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
