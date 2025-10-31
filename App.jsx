import React, { useState } from 'react'
import PptxGenJS from 'pptxgenjs'
import jsPDF from 'jspdf'

export default function App(){
  const [prompt, setPrompt] = useState('A mobile app that helps busy parents coordinate childcare using crowdsourced trusted sitters.')
  const [loading, setLoading] = useState(false)
  const [slides, setSlides] = useState([])
  const [title, setTitle] = useState('SmartPitch Startup')
  const [tagline, setTagline] = useState('Make childcare simple.')

  async function generate(){
    setLoading(true)
    setSlides([])
    try{
      const res = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) })
      const data = await res.json()
      if(data.ok){
        setTitle(data.title || 'SmartPitch Startup')
        setTagline(data.tagline || '')
        setSlides(data.slides || [])
      } else {
        alert('Generation failed: '+(data.error || 'unknown'))
      }
    }catch(e){
      alert('Error: '+e.message)
    }finally{
      setLoading(false)
    }
  }

  function downloadPPTX(){
    const pres = new PptxGenJS()
    pres.author = 'SmartPitch'
    pres.layout = 'LAYOUT_WIDE'
    slides.forEach(s=>{
      const slide = pres.addSlide()
      slide.addText(title, { x:0.5, y:0.3, fontSize:24, bold:true })
      slide.addText(s.title, { x:0.5, y:1.2, fontSize:18, color:'363636' })
      slide.addText(s.content, { x:0.5, y:2.2, fontSize:14, color:'444444', w:9 })
    })
    pres.writeFile({ fileName: (title.replace(/\s+/g,'_')||'deck') + '.pptx' })
  }

  function downloadPDF(){
    const doc = new jsPDF('landscape')
    slides.forEach((s,i)=>{
      doc.setFontSize(22); doc.text(title, 20, 20)
      doc.setFontSize(16); doc.text(s.title, 20, 40)
      doc.setFontSize(12); doc.text(doc.splitTextToSize(s.content, 260), 20, 60)
      if(i < slides.length-1) doc.addPage()
    })
    doc.save((title.replace(/\s+/g,'_')||'deck') + '.pdf')
  }

  return (<div className="container">
    <div className="header"><h1>SmartPitch — AI Pitch Deck Builder</h1><div>Prototype</div></div>
    <div className="card" style={{marginTop:12}}>
      <label><strong>Startup idea</strong></label>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} />
      <div className="controls">
        <button className="btn" onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate Pitch'}</button>
        <button className="btn" onClick={downloadPPTX} disabled={slides.length===0}>Download PPTX</button>
        <button className="btn" onClick={downloadPDF} disabled={slides.length===0}>Download PDF</button>
      </div>
      <div style={{marginTop:12}}>
        <label><strong>Title</strong></label>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',padding:8,marginTop:6,borderRadius:6,background:'transparent',border:'1px solid rgba(255,255,255,0.06)'}} />
        <label style={{marginTop:8,display:'block'}}><strong>Tagline</strong></label>
        <input value={tagline} onChange={e=>setTagline(e.target.value)} style={{width:'100%',padding:8,marginTop:6,borderRadius:6,background:'transparent',border:'1px solid rgba(255,255,255,0.06)'}} />
      </div>
      <div className="slides">
        {slides.map((s,idx)=>(
          <div key={idx} className="slide card">
            <h4>{s.title}</h4>
            <div style={{fontSize:12,color:'#cfe7ff'}}>{s.content}</div>
          </div>
        ))}
      </div>
      <div className="footer">Tip: Edit titles and slide text before exporting. This prototype uses an API endpoint at <code>/api/generate</code>.</div>
    </div>
  </div>)
}
