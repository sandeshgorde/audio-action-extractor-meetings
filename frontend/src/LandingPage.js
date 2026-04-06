import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(32px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; will-change: opacity, transform; }
      .fade-up-1 { animation-delay: 0.1s; }
      .fade-up-2 { animation-delay: 0.2s; }
      .fade-up-3 { animation-delay: 0.3s; }
      .fade-up-4 { animation-delay: 0.4s; }
      .nav-link {
        font-size: 14px; color: #666; text-decoration: none; font-family: 'DM Sans', sans-serif;
        font-weight: 400; transition: color 0.2s; cursor: pointer;
      }
      .nav-link:hover { color: #000; }
      .btn-primary {
        background: #000; color: #fff; border: none;
        padding: 13px 28px; border-radius: 6px;
        font-size: 14px; font-weight: 500; cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        transition: opacity 0.2s, transform 0.15s;
      }
      .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
      .btn-outline {
        background: transparent; color: #000;
        border: 1.5px solid #000;
        padding: 13px 28px; border-radius: 6px;
        font-size: 14px; font-weight: 500; cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        transition: background 0.2s, color 0.2s, transform 0.15s;
      }
      .btn-outline:hover { background: #000; color: #fff; transform: translateY(-1px); }
      .feature-card {
        padding: 28px 24px; border: 1px solid #e5e5e5;
        transition: border-color 0.2s, transform 0.2s;
        background: #fff; border-radius: 12px;
      }
      .feature-card:hover { border-color: #000; transform: translateY(-2px); }
      .step-card { transition: transform 0.2s; }
      .step-card:hover { transform: translateY(-4px); }
      .photo-card {
        overflow: hidden; border-radius: 12px;
        transition: transform 0.3s;
      }
      .photo-card:hover { transform: scale(1.02); }
      .photo-card img { 
        width: 100%; height: 100%; object-fit: cover;
        transition: transform 0.5s;
      }
      .photo-card:hover img { transform: scale(1.05); }
      .tech-badge {
        border: 1px solid #e0e0e0; border-radius: 6px;
        padding: 8px 16px; font-size: 12px; font-weight: 500;
        color: #555; font-family: 'DM Sans', sans-serif;
        transition: border-color 0.2s, color 0.2s;
        white-space: nowrap;
      }
      .tech-badge:hover { border-color: #000; color: #000; }
      .scroll-reveal { will-change: opacity, transform; }
      @media (max-width: 768px) {
        .hero-heading { font-size: 48px !important; }
        .section-heading { font-size: 36px !important; }
        .cta-heading { font-size: 36px !important; }
        .steps-grid { grid-template-columns: 1fr !important; }
        .features-grid { grid-template-columns: 1fr !important; }
        .photos-grid { grid-template-columns: 1fr !important; }
        .tech-grid { gap: 8px !important; }
        .nav-links { display: none !important; }
        .mobile-menu-btn { display: flex !important; }
        .footer-inner { flex-direction: column !important; gap: 12px !important; text-align: center !important; }
        .hero-buttons { flex-direction: column !important; align-items: center !important; }
        .hero-buttons button { width: 100% !important; max-width: 300px !important; }
      }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(el => {
          if (el.isIntersecting) {
            el.target.style.opacity = '1';
            el.target.style.transform = 'translateY(0)';
            observer.unobserve(el.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
      el.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      observer.observe(el);
    });

    return () => {
      style.remove();
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#000', overflowX: 'hidden' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px) saturate(200%)',
        borderBottom: '1px solid #e0e0e0',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', background: '#000', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '500', letterSpacing: '-0.01em' }}>Meeting Analyzer</span>
        </div>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Features</span>
          <span className="nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}>How it works</span>
          <span className="nav-link" onClick={() => document.getElementById('team')?.scrollIntoView({behavior:'smooth'})}>Team</span>
          <button className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }} onClick={() => navigate('/analyzer')}>Go to App</button>
        </div>

        <button className="mobile-menu-btn" 
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> 
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 99,
          background: '#fff', borderBottom: '1px solid #f0f0f0',
          padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          <span className="nav-link" onClick={() => { document.getElementById('features')?.scrollIntoView({behavior:'smooth'}); setMenuOpen(false); }}>Features</span>
          <span className="nav-link" onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'}); setMenuOpen(false); }}>How it works</span>
          <span className="nav-link" onClick={() => { document.getElementById('team')?.scrollIntoView({behavior:'smooth'}); setMenuOpen(false); }}>Team</span>
          <button className="btn-primary" onClick={() => navigate('/analyzer')}>Go to App</button>
        </div>
      )}

      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
      }}>
        <div className="fade-up fade-up-1" style={{
          display: 'inline-block', border: '1px solid #e0e0e0',
          borderRadius: '100px', padding: '6px 16px',
          fontSize: '12px', color: '#666', marginBottom: '32px',
          fontWeight: '400', letterSpacing: '0.02em'
        }}>
          AI-Powered · Free · No signup required
        </div>

        <h1 className="fade-up fade-up-2 hero-heading" style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(48px, 9vw, 96px)',
          fontWeight: '700',
          lineHeight: '1.05',
          letterSpacing: '-0.03em',
          color: '#000',
          marginBottom: '28px',
          maxWidth: '900px',
        }}>
          Turn meeting audio into clear actions
        </h1>

        <p className="fade-up fade-up-3" style={{
          fontSize: '17px', color: '#666', maxWidth: '480px',
          lineHeight: '1.7', marginBottom: '44px', fontWeight: '400'
        }}>
          Upload any recording and instantly get transcripts, action items, 
          priorities, assignees, and an AI-written summary.
        </p>

        <div className="fade-up fade-up-4 hero-buttons" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => navigate('/analyzer')}>Analyze a meeting</button>
          <button className="btn-outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}>See how it works</button>
        </div>

        <div className="fade-up fade-up-4 photo-card" style={{
          marginTop: '80px', width: '100%', maxWidth: '1000px',
          height: 'clamp(280px, 45vw, 520px)', borderRadius: '16px',
        }}>
          <img src="/photo2.jpg" alt="Team meeting" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'16px' }} />
        </div>
      </section>

      <section id="how-it-works" style={{ padding: '120px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="scroll-reveal" style={{ marginBottom: '80px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
            How it works
          </div>
          <h2 className="section-heading" style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '700',
            letterSpacing: '-0.025em', lineHeight: '1.05', color: '#000'
          }}>
            Three steps to clarity
          </h2>
        </div>

        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
          {[
            {
              num: '01',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
              title: 'Upload your audio',
              desc: 'Drop any meeting recording - MP3, WAV, M4A, FLAC up to 50MB. Works with any device or platform recording.'
            },
            {
              num: '02',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
              title: 'AI transcribes and analyzes',
              desc: "Groq's Whisper model transcribes with high accuracy. LLaMA 3.3 70B then extracts every action item intelligently."
            },
            {
              num: '03',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
              title: 'Get instant results',
              desc: 'Full transcript, prioritized action items with deadlines and assignees, plus an AI-written meeting summary.'
            }
          ].map((step, i) => (
            <div key={i} className="step-card scroll-reveal" style={{ animationDelay: `${i * 0.15}s` }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '64px', fontWeight: '700', color: '#f5f5f5',
                lineHeight: '1', marginBottom: '24px', letterSpacing: '-0.03em'
              }}>{step.num}</div>
              <div style={{
                width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
              }}>{step.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', letterSpacing: '-0.01em' }}>{step.title}</h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7', fontWeight: '400' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '120px 0', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div className="photos-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '20px', minHeight: 'clamp(400px, 55vw, 640px)'
          }}>
            <div className="photo-card" style={{ minHeight: 'clamp(400px, 55vw, 640px)' }}>
              <img src="/photo3.jpg" alt="Team collaborating" />
            </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="photo-card" style={{ flex: 1 }}>
                <img src="/photo1.jpg" alt="Working on laptop" />
              </div>
              <div style={{
                background: '#000', borderRadius: '12px', padding: '32px',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: '0 0 180px'
              }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '42px', fontWeight: '700', color: '#fff', lineHeight: '1', marginBottom: '8px' }}>500+</div>
                <div style={{ fontSize: '13px', color: '#888', fontWeight: '400' }}>minutes free per month via Groq</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: '140px 24px 120px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="scroll-reveal" style={{ marginBottom: '80px', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>Features</div>
            <h2 className="section-heading" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '700',
              letterSpacing: '-0.025em', lineHeight: '1.05'
            }}>
              Everything your meeting actually needs
            </h2>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>, name: 'AI Transcription', desc: 'Groq Whisper Large V3 converts your audio to text with high accuracy across accents and meeting styles.' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, name: 'Smart Action Items', desc: 'LLM identifies real tasks from conversation with full context and summaries.' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, name: 'Priority Detection', desc: 'High, Medium, Low - every task is scored by urgency so your team knows what to tackle first.' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, name: 'AI Summary', desc: 'A concise meeting summary written by LLaMA 3.3 70B ready to share immediately.' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, name: 'Deadline Extraction', desc: "Natural phrases like 'by Friday' or 'end of week' are converted to real dates automatically." },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, name: 'Detailed Analysis', desc: 'Full second page with task tables, priority charts, key insights, and searchable transcript.' },
            ].map((f, i) => (
              <div key={i} className="feature-card scroll-reveal">
                <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', letterSpacing: '-0.01em' }}>{f.name}</h3>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', fontWeight: '400' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="team" style={{ padding: '120px 24px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
  <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
    <div className="scroll-reveal" style={{ marginBottom: '64px' }}>
      <div style={{ fontSize: '11px', fontWeight: '500', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>The Team</div>
      <h2 className="section-heading" style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '700',
        letterSpacing: '-0.025em', lineHeight: '1.05', maxWidth: '600px'
      }}>
        Built by 5 students, together.
      </h2>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
      <div className="scroll-reveal">
        <div className="photo-card" style={{ height: 'clamp(300px, 38vw, 460px)', borderRadius: '16px', marginBottom: '32px' }}>
          <img src="/photo2.jpg" alt="Team working" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
        </div>
        <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.8', fontWeight: '400' }}>
          A full-stack AI application built with Java, Python, and React. 
          From architecture to deployment, every layer was designed and coded by our team.
        </p>
      </div>

      <div className="scroll-reveal" style={{ paddingTop: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #e5e5e5', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '28px 24px', background: '#fff', borderRight: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#000', letterSpacing: '-0.03em', lineHeight: '1' }}>5</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#000', marginTop: '8px' }}>Team members</div>
          </div>
          <div style={{ padding: '28px 24px', background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#000', letterSpacing: '-0.03em', lineHeight: '1' }}>3</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#000', marginTop: '8px' }}>Tech stacks</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Java · Python · React</div>
          </div>
          <div style={{ padding: '28px 24px', background: '#fff', borderRight: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#000', letterSpacing: '-0.03em', lineHeight: '1' }}>₹0</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#000', marginTop: '8px' }}>Monthly cost</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Fully free to run</div>
          </div>
          <a href="https://github.com/sandeshgorde/audio-action-extractor-meetings" target="_blank" rel="noreferrer" style={{ padding: '28px 24px', background: '#000', textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', minHeight: '120px' }}>
            <div style={{ fontSize: '11px', color: '#555', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Open source</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>↗ View on GitHub</div>
              <div style={{ fontSize: '12px', color: '#666' }}>audio-action-extractor-meetings</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

      <section style={{ padding: '120px 24px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="scroll-reveal" style={{ marginBottom: '64px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>Built with</div>
            <h2 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '700',
              letterSpacing: '-0.025em', lineHeight: '1.05'
            }}>Zero cost.</h2>
          </div>

          <div className="scroll-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', border: '1px solid #e5e5e5', borderRadius: '16px', overflow: 'hidden' }}>
            {[
              { name: 'Spring Boot 3.2', role: 'Backend framework', tag: 'Java' },
              { name: 'React 18', role: 'Frontend UI', tag: 'JavaScript' },
              { name: 'Groq Whisper', role: 'Audio transcription', tag: 'AI' },
              { name: 'LLaMA 3.3 70B', role: 'Action extraction', tag: 'AI' },
              { name: 'Python 3', role: 'Transcription script', tag: 'Script' },
              { name: 'Docker', role: 'Containerization', tag: 'DevOps' },
              { name: 'Render', role: 'Backend hosting', tag: 'Free tier' },
              { name: 'Vercel', role: 'Frontend hosting', tag: 'Free tier' },
              { name: 'Java 17', role: 'Core language', tag: 'Language' },
            ].map(({ name, role, tag }) => (
              <div key={name} style={{ padding: '28px 24px', background: '#fff', borderBottom: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px', minHeight: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', color: '#bbb', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tag}</span>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>{name}</div>
                  <div style={{ fontSize: '13px', color: '#999', fontWeight: '400' }}>{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '160px 24px', textAlign: 'center',
        borderTop: '1px solid #f0f0f0', background: '#000'
      }}>
        <div className="scroll-reveal">
          <h2 className="cta-heading" style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: '700',
            letterSpacing: '-0.03em', color: '#fff',
            maxWidth: '800px', margin: '0 auto 48px', lineHeight: '1.05'
          }}>
            Never miss an action item again
          </h2>
          <button className="btn-outline" style={{ color: '#fff', borderColor: '#fff' }}
            onClick={() => navigate('/analyzer')}>
            Analyze a meeting
          </button>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '20px', fontWeight: '400' }}>
            Free forever - No account needed - Results in seconds
          </p>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #1a1a1a', background: '#000', padding: '28px 32px' }}>
        <div className="footer-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: '#666', fontWeight: '400' }}>
            2026 Meeting Analyzer
          </span>
          <a href="https://github.com/sandeshgorde/audio-action-extractor-meetings"
            target="_blank" rel="noreferrer"
            style={{ fontSize: '13px', color: '#666', textDecoration: 'none', fontWeight: '400' }}>
            GitHub
          </a>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
