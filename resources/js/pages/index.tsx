import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// ── Images Unsplash libres de droits ──────────────────────────────────────────
const IMGS = {
    hero:        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80&auto=format&fit=crop',   // dashboard analytics dark
    heroOverlay: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&auto=format&fit=crop', // charts laptop
    team:        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80&auto=format&fit=crop',  // team meeting
    analysis:    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80&auto=format&fit=crop',  // data analysis
    mobile:      'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=900&q=80&auto=format&fit=crop',  // tablet app
    office:      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop',  // office people
    chart:       'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=900&q=80&auto=format&fit=crop',     // chart stats
};

export default function Welcome() {
    const [openFaq, setOpenFaq]         = useState<number | null>(null);
    const [copied, setCopied]           = useState('');
    const [activeFeature, setActiveFeature] = useState(0);
    const [scrollY, setScrollY]         = useState(0);

    useEffect(() => {
        const fn = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    const features = [
        { icon: '✦', title: 'Éditeur visuel',   desc: '20+ types de champs, glisser-déposer, aperçu instantané.', color: '#6366f1', img: IMGS.mobile },
        { icon: '◈', title: 'Analyse IA',        desc: 'Insights automatiques, détection de tendances en temps réel.', color: '#0ea5e9', img: IMGS.analysis },
        { icon: '◉', title: 'Distribution',      desc: 'Email, lien, QR code, widget embarqué ou API REST.', color: '#10b981', img: IMGS.office },
        { icon: '◎', title: 'Rapports live',     desc: 'Dashboards dynamiques, exports PDF et Excel à la demande.', color: '#f59e0b', img: IMGS.chart },
        { icon: '◆', title: 'Logique avancée',   desc: 'Branchements conditionnels, parcours adaptatifs.', color: '#ec4899', img: IMGS.mobile },
        { icon: '◍', title: 'Sécurité RGPD',     desc: 'Chiffrement AES-256, conformité totale, hébergement EU.', color: '#14b8a6', img: IMGS.team },
    ];

    return (
        <>
            <Head title="STATS ENQUETES — Enquêtes intelligentes">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:300,400,500,600,700,800&family=bricolage-grotesque:400,500,600,700,800" rel="stylesheet" />
            </Head>

            <style>{`
                *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
                :root {
                    --bg:#f8f7ff; --white:#fff; --border:#ede9fe; --border2:#e2e8f0;
                    --text:#1e1b4b; --muted:#64748b; --accent:#6366f1; --accent-lt:#eef2ff;
                    --sh: 0 1px 3px rgba(0,0,0,.05), 0 4px 16px rgba(99,102,241,.07);
                    --sh-lg: 0 8px 32px rgba(99,102,241,.13), 0 2px 8px rgba(0,0,0,.04);
                }
                body { font-family:'Plus Jakarta Sans',sans-serif; background:var(--bg); color:var(--text); -webkit-font-smoothing:antialiased; }
                h1,h2,h3,h4 { font-family:'Bricolage Grotesque',sans-serif; }

                @keyframes up    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
                @keyframes blob  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-18px) scale(1.04)} 66%{transform:translate(-18px,18px) scale(.97)} }
                @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
                @keyframes shimmer { from{background-position:-400px 0} to{background-position:400px 0} }

                .u0{animation:up .6s ease both} .u1{animation:up .6s .1s ease both}
                .u2{animation:up .6s .2s ease both} .u3{animation:up .6s .3s ease both}
                .u4{animation:up .6s .4s ease both}

                .blob { position:absolute; border-radius:50%; filter:blur(72px); animation:blob 14s ease-in-out infinite; pointer-events:none; }
                .mq   { animation:marquee 26s linear infinite; display:flex; width:max-content; }

                .pill { display:inline-flex; align-items:center; gap:7px; padding:5px 14px; border-radius:100px; font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }

                .btn-p { display:inline-flex; align-items:center; gap:9px; background:var(--accent); color:#fff; padding:14px 28px; border-radius:14px; font-size:14px; font-weight:700; text-decoration:none; transition:all .25s cubic-bezier(.4,0,.2,1); box-shadow:0 4px 20px rgba(99,102,241,.28); }
                .btn-p:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(99,102,241,.38); background:#5254cc; }

                .btn-g { display:inline-flex; align-items:center; gap:9px; color:var(--muted); padding:14px 28px; border-radius:14px; font-size:14px; font-weight:600; text-decoration:none; border:1.5px solid var(--border2); transition:all .25s; background:#fff; }
                .btn-g:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-lt); transform:translateY(-2px); }

                .card { background:#fff; border:1.5px solid var(--border); border-radius:20px; box-shadow:var(--sh); transition:all .3s cubic-bezier(.4,0,.2,1); }
                .card:hover { box-shadow:var(--sh-lg); transform:translateY(-3px); border-color:var(--accent); }

                .feat { display:flex; align-items:flex-start; gap:16px; padding:18px 22px; border-radius:16px; border:1.5px solid transparent; cursor:pointer; transition:all .2s; }
                .feat:hover { background:rgba(99,102,241,.03); border-color:var(--border); }
                .feat.on { background:var(--accent-lt); border-color:rgba(99,102,241,.2); }

                .tpl  { background:#fff; border:1.5px solid var(--border); border-radius:18px; padding:22px; transition:all .25s; cursor:pointer; }
                .tpl:hover { border-color:var(--accent); box-shadow:0 8px 32px rgba(99,102,241,.1); transform:translateY(-4px); }

                .nav-a { font-size:14px; font-weight:500; color:var(--muted); text-decoration:none; position:relative; transition:color .2s; }
                .nav-a::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:2px; background:var(--accent); border-radius:2px; transition:width .3s; }
                .nav-a:hover { color:var(--accent); }
                .nav-a:hover::after { width:100%; }

                .cp { background:#f8f9fc; border:1.5px solid var(--border); border-radius:14px; padding:14px 18px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; transition:border-color .2s; }
                .cp:hover { border-color:var(--accent); }

                .fq { border-bottom:1px solid var(--border); padding:22px 0; }
                .fq:last-child { border-bottom:none; }

                .img-hero { width:100%; height:100%; object-fit:cover; object-position:center; }
                .img-rounded { border-radius:20px; object-fit:cover; display:block; width:100%; }
                .img-feature { width:100%; height:220px; object-fit:cover; border-radius:14px; margin-bottom:0; }

                ::-webkit-scrollbar { width:5px; }
                ::-webkit-scrollbar-track { background:#f1f5f9; }
                ::-webkit-scrollbar-thumb { background:rgba(99,102,241,.25); border-radius:3px; }
            `}</style>

            {/* ── NAV ─────────────────────────────────────────────────────────── */}
            <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, transition:'all .35s', background: scrollY>30?'rgba(255,255,255,.9)':'transparent', backdropFilter: scrollY>30?'blur(20px)':'none', boxShadow: scrollY>30?'0 1px 0 rgba(0,0,0,.05)':'none' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:34, height:34, borderRadius:11, background:'linear-gradient(135deg,#6366f1,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(99,102,241,.3)' }}>
                            <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                        </div>
                        <span style={{ fontFamily:'Bricolage Grotesque', fontWeight:800, fontSize:15, color:'#1e1b4b', letterSpacing:'-.01em' }}>STATS ENQUETES</span>
                    </div>
                    <div style={{ display:'flex', gap:32 }}>
                        {[['Fonctionnalités','#features'],['Modèles','#modeles'],['Démo','#demo']].map(([l,h]) => <a key={l} href={h} className="nav-a">{l}</a>)}
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <Link href="/login" style={{ fontSize:14, fontWeight:600, color:'#64748b', textDecoration:'none', padding:'8px 14px', borderRadius:10, transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#6366f1'} onMouseLeave={e=>e.currentTarget.style.color='#64748b'}>Connexion</Link>
                        <Link href="/login" className="btn-p" style={{ padding:'9px 20px', fontSize:13, borderRadius:11 }}>Démarrer gratuitement</Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO avec image de fond ──────────────────────────────────────── */}
            <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden', paddingTop:64 }}>

                {/* Image de fond avec overlay */}
                <div style={{ position:'absolute', inset:0, zIndex:0 }}>
                    <img src={IMGS.hero} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}/>
                    {/* Overlay dégradé qui laisse voir l'image à droite */}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(100deg, rgba(248,247,255,0.97) 0%, rgba(248,247,255,0.9) 40%, rgba(248,247,255,0.6) 65%, rgba(248,247,255,0.1) 100%)' }}/>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(248,247,255,0) 60%, rgba(248,247,255,1) 100%)' }}/>
                </div>

                {/* Blobs sur l'overlay */}
                <div className="blob" style={{ width:500, height:500, top:-100, left:-100, background:'rgba(99,102,241,.06)', zIndex:1 }}/>
                <div className="blob" style={{ width:350, height:350, bottom:-60, left:'30%', background:'rgba(14,165,233,.05)', animationDelay:'5s', zIndex:1 }}/>

                {/* Grille de points */}
                <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, #c7d2fe 1px, transparent 1px)', backgroundSize:'40px 40px', opacity:.25, zIndex:1 }}/>

                <div style={{ maxWidth:1200, margin:'0 auto', padding:'96px 24px', position:'relative', zIndex:2, width:'100%' }}>
                    <div style={{ maxWidth:680 }}>
                       
                        <h1 className="u1" style={{ fontSize:'clamp(2.8rem,6.5vw,5.8rem)', fontWeight:800, lineHeight:1.02, letterSpacing:'-.04em', marginBottom:28, color:'#1e1b4b' }}>
                            Des enquêtes qui{' '}
                            <span style={{ background:'linear-gradient(135deg,#6366f1 0%,#818cf8 45%,#06b6d4 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>transforment</span>
                            <br/>vos décisions
                        </h1>
                        <p className="u2" style={{ fontSize:18, color:'#64748b', lineHeight:1.75, maxWidth:480, marginBottom:44, fontWeight:400 }}>
                            Créez, distribuez et analysez des enquêtes professionnelles. Notre IA génère vos insights en temps réel.
                        </p>
                        <div className="u3" style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:64 }}>
                            <Link href="/login" className="btn-p" style={{ fontSize:15, padding:'15px 32px' }}>
                                Créer mon enquête gratuite
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                            </Link>
                            <a href="#demo" className="btn-g" style={{ fontSize:15, padding:'15px 26px' }}>
                                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Voir la démo
                            </a>
                        </div>
                        {/* Stats bar */}
                        <div className="u4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', background:'rgba(255,255,255,.9)', backdropFilter:'blur(12px)', borderRadius:18, border:'1.5px solid #ede9fe', overflow:'hidden', boxShadow:'0 4px 24px rgba(99,102,241,.1)', maxWidth:540 }}>
                            {[{n:'120K+',l:'Enquêtes'},{n:'8M+',l:'Réponses'},{n:'98%',l:'Satisfaction'},{n:'45s',l:'Création'}].map((s,i) => (
                                <div key={s.n} style={{ padding:'18px 16px', textAlign:'center', borderRight: i<3?'1px solid #ede9fe':'none' }}>
                                    <div style={{ fontSize:22, fontWeight:800, fontFamily:'Bricolage Grotesque', color:'#6366f1', letterSpacing:'-.03em' }}>{s.n}</div>
                                    <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, marginTop:2, textTransform:'uppercase', letterSpacing:'.07em' }}>{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRUST ────────────────────────────────────────────────────────── */}
            {/* <div style={{ background:'#fff', borderTop:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9', padding:'14px 0', overflow:'hidden' }}>
                <div className="mq">
                    {[...Array(2)].map((_,a) => (
                        <div key={a} style={{ display:'flex', gap:56, paddingRight:56, alignItems:'center' }}>
                            {['Université de Douala','Ministère Santé','BancAfrique','Orange CI','Groupe Cebar','BICEC','MTN Cameroun','AXA Assurances'].map(o => (
                                <span key={o} style={{ fontSize:13, fontWeight:600, color:'#cbd5e1', letterSpacing:'.04em', whiteSpace:'nowrap' }}>{o}</span>
                            ))}
                        </div>
                    ))}
                </div>
            </div> */}

            {/* ── FEATURES ─────────────────────────────────────────────────────── */}
            <section id="features" style={{ padding:'112px 24px', maxWidth:1200, margin:'0 auto' }}>
                <div style={{ textAlign:'center', marginBottom:64 }}>
                    <div className="pill" style={{ background:'rgba(99,102,241,.07)', border:'1px solid rgba(99,102,241,.12)', color:'#6366f1', marginBottom:14, display:'inline-flex' }}>Fonctionnalités</div>
                    <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-.03em', marginBottom:12, color:'#1e1b4b' }}>Tout ce qu'il faut pour réussir</h2>
                    <p style={{ fontSize:17, color:'#64748b', maxWidth:420, margin:'0 auto', lineHeight:1.7 }}>De la création à l'analyse, chaque étape couverte avec précision.</p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'5fr 4fr', gap:24, alignItems:'start' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {features.map((f,i) => (
                            <div key={i} className={`feat ${activeFeature===i?'on':''}`} onClick={()=>setActiveFeature(i)}>
                                <div style={{ width:40, height:40, borderRadius:12, background:`${f.color}12`, border:`1px solid ${f.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:f.color, flexShrink:0 }}>{f.icon}</div>
                                <div style={{ flex:1 }}>
                                    <div style={{ fontSize:15, fontWeight:700, fontFamily:'Bricolage Grotesque', color:activeFeature===i?'#6366f1':'#1e1b4b', marginBottom:3 }}>{f.title}</div>
                                    <div style={{ fontSize:13, color:'#64748b', lineHeight:1.6 }}>{f.desc}</div>
                                </div>
                                <svg width="15" height="15" fill="none" stroke={activeFeature===i?'#6366f1':'#cbd5e1'} viewBox="0 0 24 24" style={{ flexShrink:0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                            </div>
                        ))}
                    </div>

                    {/* Panneau détail avec image */}
                    <div style={{ position:'sticky', top:88 }}>
                        <div style={{ background:'#fff', borderRadius:24, border:'1.5px solid #ede9fe', overflow:'hidden', boxShadow:'0 8px 40px rgba(99,102,241,.08)' }}>
                            {/* Image de la feature */}
                            <div style={{ height:200, overflow:'hidden', position:'relative' }}>
                                <img src={features[activeFeature].img} alt={features[activeFeature].title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'all .4s' }}/>
                                <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom, transparent 40%, rgba(255,255,255,.95) 100%)` }}/>
                                <div style={{ position:'absolute', bottom:16, left:20, display:'flex', alignItems:'center', gap:8 }}>
                                    <div style={{ width:36, height:36, borderRadius:11, background:`${features[activeFeature].color}18`, border:`1.5px solid ${features[activeFeature].color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:features[activeFeature].color }}>{features[activeFeature].icon}</div>
                                </div>
                            </div>
                            <div style={{ padding:'20px 28px 28px' }}>
                                <div style={{ fontSize:10, fontWeight:700, color:features[activeFeature].color, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>0{activeFeature+1} / 06</div>
                                <h3 style={{ fontSize:24, fontWeight:800, letterSpacing:'-.02em', marginBottom:10, color:'#1e1b4b' }}>{features[activeFeature].title}</h3>
                                <p style={{ fontSize:14, color:'#64748b', lineHeight:1.8, marginBottom:20 }}>{features[activeFeature].desc}</p>
                                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#f8f9fc', borderRadius:11 }}>
                                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981' }}/>
                                    <span style={{ fontSize:12, color:'#64748b' }}>Disponible sur tous les plans</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION TEAM PHOTO ────────────────────────────────────────────── */}
            <section style={{ padding:'0 24px 112px', maxWidth:1200, margin:'0 auto' }}>
                <div style={{ borderRadius:28, overflow:'hidden', position:'relative', height:440 }}>
                    <img src={IMGS.team} alt="Équipe au travail" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}/>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(100deg, rgba(99,102,241,.85) 0%, rgba(30,27,75,.6) 50%, transparent 100%)' }}/>
                    <div style={{ position:'absolute', top:0, left:0, bottom:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 56px', maxWidth:560 }}>
                        <div className="pill" style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', color:'white', marginBottom:20, display:'inline-flex' }}>Pourquoi nous choisir</div>
                        <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.15, color:'white', marginBottom:16 }}>
                            La plateforme que les équipes adorent
                        </h2>
                        <p style={{ fontSize:16, color:'rgba(255,255,255,.75)', lineHeight:1.75, marginBottom:28, fontWeight:400 }}>
                            Des PME aux grandes entreprises africaines, STATS ENQUETES s'adapte à chaque besoin de collecte de données.
                        </p>
                        <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'white', color:'#6366f1', padding:'12px 24px', borderRadius:12, fontSize:14, fontWeight:700, textDecoration:'none', width:'fit-content', transition:'all .25s' }}
                            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.15)';}}
                            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                            Découvrir la plateforme →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── TEMPLATES ────────────────────────────────────────────────────── */}
            <section id="modeles" style={{ padding:'112px 24px', background:'#fff' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }}>
                    <div>
                        <div className="pill" style={{ background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.15)', color:'#d97706', marginBottom:20, display:'inline-flex' }}>100+ modèles prêts</div>
                        <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.15, marginBottom:18, color:'#1e1b4b' }}>
                            Partez d'un modèle,<br/>
                            <span style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>personnalisez tout</span>
                        </h2>
                        <p style={{ fontSize:16, color:'#64748b', lineHeight:1.8, marginBottom:28 }}>Bibliothèque couvrant RH, santé, éducation, marketing et recherche académique.</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:36 }}>
                            {['Satisfaction client','Enquête RH','Feedback produit','NPS','Quiz','Recherche'].map(t => (
                                <span key={t} style={{ fontSize:12, fontWeight:500, color:'#64748b', border:'1.5px solid #e2e8f0', padding:'5px 12px', borderRadius:100, cursor:'default', transition:'all .2s' }}
                                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#6366f1';e.currentTarget.style.color='#6366f1';e.currentTarget.style.background='rgba(99,102,241,.05)';}}
                                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#64748b';e.currentTarget.style.background='transparent';}}>{t}
                                </span>
                            ))}
                        </div>
                        <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', color:'white', padding:'13px 26px', borderRadius:13, fontSize:14, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 20px rgba(245,158,11,.28)', transition:'all .25s' }}
                            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(245,158,11,.38)';}}
                            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 20px rgba(245,158,11,.28)';}}>
                            Explorer les modèles →
                        </Link>
                    </div>

                    {/* Image + cards overlay */}
                    <div style={{ position:'relative' }}>
                        <img src={IMGS.chart} alt="Graphiques statistiques" className="img-rounded" style={{ height:380 }}/>
                        {/* Mini cards flottantes */}
                        <div style={{ position:'absolute', bottom:-20, left:-20, background:'#fff', borderRadius:18, padding:'16px 20px', border:'1.5px solid #ede9fe', boxShadow:'0 8px 32px rgba(99,102,241,.12)', display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📊</div>
                            <div>
                                <div style={{ fontSize:13, fontWeight:700, color:'#1e1b4b', fontFamily:'Bricolage Grotesque' }}>+12 000 réponses</div>
                                <div style={{ fontSize:11, color:'#94a3b8' }}>Cette semaine</div>
                            </div>
                        </div>
                        <div style={{ position:'absolute', top:-16, right:-16, background:'#fff', borderRadius:16, padding:'12px 18px', border:'1.5px solid #ede9fe', boxShadow:'0 8px 32px rgba(99,102,241,.1)', display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:11, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>✅</div>
                            <div>
                                <div style={{ fontSize:12, fontWeight:700, color:'#1e1b4b' }}>98% satisfaction</div>
                                <div style={{ fontSize:11, color:'#94a3b8' }}>2 000+ avis</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── DEMO ─────────────────────────────────────────────────────────── */}
            <section id="demo" style={{ padding:'112px 24px' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }}>
                    <div>
                        <div className="pill" style={{ background:'rgba(16,185,129,.07)', border:'1px solid rgba(16,185,129,.14)', color:'#059669', marginBottom:20, display:'inline-flex' }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block' }}/>
                            Accès gratuit immédiat
                        </div>
                        <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.15, marginBottom:18, color:'#1e1b4b' }}>
                            Testez sans<br/>
                            <span style={{ background:'linear-gradient(135deg,#6366f1,#0ea5e9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>engagement</span>
                        </h2>

                        {/* Image de l'analyse */}
                        <div style={{ borderRadius:18, overflow:'hidden', marginBottom:28, position:'relative' }}>
                            <img src={IMGS.analysis} alt="Analyse de données" style={{ width:'100%', height:200, objectFit:'cover' }}/>
                            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(255,255,255,.8) 0%, transparent 60%)' }}/>
                        </div>

                        {['Éditeur complet déverrouillé','Dashboard analytique avec données test','Toutes les intégrations actives','Aucune carte bancaire requise'].map(item => (
                            <div key={item} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                                <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(99,102,241,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <svg width="10" height="10" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                </div>
                                <span style={{ fontSize:14, color:'#475569' }}>{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding:36, borderRadius:28, boxShadow:'0 16px 64px rgba(99,102,241,.1)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
                            <div style={{ width:52, height:52, borderRadius:18, background:'linear-gradient(135deg,#6366f1,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(99,102,241,.28)' }}>
                                <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                            </div>
                            <div>
                                <div style={{ fontSize:17, fontWeight:800, fontFamily:'Bricolage Grotesque', color:'#1e1b4b' }}>Compte de démonstration</div>
                                <div style={{ fontSize:13, color:'#94a3b8' }}>Prêt à l'emploi · Sans inscription</div>
                            </div>
                        </div>
                        {[{label:'Email',value:'demo@stat-enquete.io',key:'email'},{label:'Mot de passe',value:'password',key:'pwd'}].map(cred => (
                            <div key={cred.key} className="cp">
                                <div>
                                    <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>{cred.label}</div>
                                    <code style={{ fontFamily:'monospace', fontSize:14, fontWeight:600, color:'#1e1b4b' }}>{cred.value}</code>
                                </div>
                                <button onClick={()=>handleCopy(cred.value,cred.key)} style={{ width:34, height:34, borderRadius:10, background: copied===cred.key?'#f0fdf4':'#f1f5f9', border:`1px solid ${copied===cred.key?'#bbf7d0':'#e2e8f0'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: copied===cred.key?'#10b981':'#64748b', transition:'all .2s' }}>
                                    {copied===cred.key?<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>:<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}
                                </button>
                            </div>
                        ))}
                        <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:11, padding:'10px 14px', marginBottom:22, marginTop:2 }}>
                            <p style={{ fontSize:12, color:'#0369a1' }}>Environnement isolé. Aucune modification persistée.</p>
                        </div>
                        <Link href="/login" className="btn-p" style={{ width:'100%', justifyContent:'center', padding:'15px', fontSize:15 }}>Accéder à la démo →</Link>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS avec photos ──────────────────────────────────────── */}
            <section style={{ padding:'112px 24px', background:'#fff' }}>
                <div style={{ maxWidth:1200, margin:'0 auto' }}>
                    <div style={{ textAlign:'center', marginBottom:56 }}>
                        <h2 style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:800, letterSpacing:'-.03em', marginBottom:8, color:'#1e1b4b' }}>
                            Ce qu'ils en{' '}
                            <span style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>disent</span>
                        </h2>
                        <p style={{ color:'#94a3b8', fontSize:15 }}>4.9 / 5 — 2 000+ avis vérifiés</p>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
                        {[
                            { name:'Dr. Aminata Diallo', role:'Chercheuse, UAC Bénin', quote:"STATS ENQUETES a transformé notre collecte terrain. L'IA donne des insights en temps réel impossibles à obtenir manuellement.", color:'#6366f1', bg:'#eef2ff', init:'AD', avatar:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&q=80&fit=crop&auto=format' },
                            { name:'Marc-Antoine Essomba', role:'DRH, Groupe Cebar', quote:"87% de taux de réponse sur nos enquêtes internes. Nos équipes adorent l'interface. C'est devenu un outil central.", color:'#0ea5e9', bg:'#f0f9ff', init:'ME', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&q=80&fit=crop&auto=format' },
                            { name:'Fatoumata Kouyaté', role:'Marketing, Orange CI', quote:"On économise des heures de reporting. Les exports automatiques et dashboards live sont vraiment impressionnants.", color:'#10b981', bg:'#f0fdf4', init:'FK', avatar:'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&q=80&fit=crop&auto=format' },
                        ].map((t,i) => (
                            <div key={i} className="card" style={{ padding:28 }}>
                                <div style={{ display:'flex', gap:3, marginBottom:20 }}>{[...Array(5)].map((_,si)=><span key={si} style={{ color:'#f59e0b', fontSize:14 }}>★</span>)}</div>
                                <p style={{ fontSize:14, color:'#475569', lineHeight:1.8, marginBottom:24, fontStyle:'italic' }}>"{t.quote}"</p>
                                <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:18, borderTop:'1px solid #f1f5f9' }}>
                                    <img src={t.avatar} alt={t.name} style={{ width:40, height:40, borderRadius:12, objectFit:'cover', border:`2px solid ${t.color}30` }}/>
                                    <div>
                                        <div style={{ fontSize:14, fontWeight:700, color:'#1e1b4b', fontFamily:'Bricolage Grotesque' }}>{t.name}</div>
                                        <div style={{ fontSize:12, color:'#94a3b8' }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────────── */}
            <section style={{ padding:'112px 24px' }}>
                <div style={{ maxWidth:660, margin:'0 auto' }}>
                    <div style={{ textAlign:'center', marginBottom:56 }}>
                        <h2 style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:800, letterSpacing:'-.03em', color:'#1e1b4b' }}>
                            Questions{' '}
                            <span style={{ background:'linear-gradient(135deg,#6366f1,#0ea5e9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>fréquentes</span>
                        </h2>
                    </div>
                    <div style={{ background:'#fff', borderRadius:24, border:'1.5px solid #ede9fe', padding:'4px 28px', boxShadow:'0 4px 24px rgba(99,102,241,.06)' }}>
                        {[
                            {q:"Combien de temps pour créer ma première enquête ?",a:"Moins de 5 minutes avec nos modèles. Choisissez, personnalisez, partagez."},
                            {q:"Mes données sont-elles sécurisées ?",a:"Chiffrement AES-256, serveurs certifiés ISO 27001, conformité RGPD complète."},
                            {q:"L'analyse IA supporte quelles langues ?",a:"Français, anglais, espagnol, arabe et portugais. D'autres langues en cours."},
                            {q:"Puis-je intégrer STATS ENQUETES à mes outils ?",a:"Oui via API REST ou intégrations Zapier, Google Sheets, Notion, Slack, HubSpot."},
                            {q:"Que se passe-t-il après la période d'essai ?",a:"Passage automatique en version Gratuite. Aucun prélèvement sans votre accord."},
                        ].map((faq,i) => (
                            <div key={i} className="fq">
                                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', textAlign:'left', gap:16, padding:0 }}>
                                    <span style={{ fontSize:15, fontWeight:600, fontFamily:'Bricolage Grotesque', color: openFaq===i?'#6366f1':'#1e1b4b', lineHeight:1.4, transition:'color .2s' }}>{faq.q}</span>
                                    <div style={{ width:30, height:30, borderRadius:9, background: openFaq===i?'#eef2ff':'#f8f9fc', border:`1px solid ${openFaq===i?'#c7d2fe':'#e2e8f0'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                                        <svg width="13" height="13" fill="none" stroke={openFaq===i?'#6366f1':'#94a3b8'} strokeWidth={2.5} viewBox="0 0 24 24" style={{ transform: openFaq===i?'rotate(180deg)':'none', transition:'transform .3s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </button>
                                {openFaq===i && <p style={{ fontSize:14, color:'#64748b', lineHeight:1.8, marginTop:12 }}>{faq.a}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA avec image ────────────────────────────────────────────────── */}
            <section style={{ padding:'80px 24px 112px' }}>
                <div style={{ maxWidth:960, margin:'0 auto' }}>
                    <div style={{ position:'relative', borderRadius:32, overflow:'hidden', minHeight:400, display:'flex', alignItems:'center' }}>
                        {/* Image de fond */}
                        <img src={IMGS.office} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(99,102,241,.92) 0%, rgba(30,27,75,.88) 100%)' }}/>
                        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)', backgroundSize:'28px 28px' }}/>
                        <div style={{ position:'relative', zIndex:1, padding:'72px 64px', textAlign:'center', width:'100%' }}>
                            <div className="pill" style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', color:'white', marginBottom:24, display:'inline-flex' }}>Prêt à commencer ?</div>
                            <h2 style={{ fontSize:'clamp(2.2rem,5vw,4rem)', fontWeight:800, letterSpacing:'-.03em', lineHeight:1.08, marginBottom:20, color:'white' }}>
                                Créez votre première<br/>enquête maintenant
                            </h2>
                            <p style={{ fontSize:17, color:'rgba(255,255,255,.75)', marginBottom:44, fontWeight:400 }}>15 000+ organisations nous font confiance. Rejoignez-les en 2 minutes.</p>
                            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
                                <Link href="/login" style={{ background:'white', color:'#6366f1', padding:'15px 36px', borderRadius:14, fontSize:15, fontWeight:800, textDecoration:'none', transition:'all .25s', fontFamily:'Bricolage Grotesque', boxShadow:'0 4px 20px rgba(0,0,0,.12)' }}
                                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,.18)';}}
                                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.12)';}}>
                                    Créer un compte gratuit
                                </Link>
                                <a href="#demo" style={{ color:'rgba(255,255,255,.85)', padding:'15px 28px', borderRadius:14, fontSize:15, fontWeight:600, textDecoration:'none', border:'1.5px solid rgba(255,255,255,.35)', transition:'all .2s' }}
                                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.1)';e.currentTarget.style.color='white';}}
                                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,.85)';}}>
                                    Voir la démo
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────────────────── */}
            <footer style={{ background:'#fff', borderTop:'1px solid #f1f5f9', padding:'52px 24px' }}>
                <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:48, marginBottom:36, paddingBottom:36, borderBottom:'1px solid #f1f5f9' }}>
                    <div>
                        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:12 }}>
                            <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                            </div>
                            <span style={{ fontFamily:'Bricolage Grotesque', fontWeight:800, fontSize:14, color:'#1e1b4b' }}>STATS ENQUETES</span>
                        </div>
                        <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.8, maxWidth:260 }}>La plateforme d'enquête moderne pour collecter, analyser et agir sur vos données.</p>
                    </div>
                    {[{h:'Produit',links:['Fonctionnalités','Modèles','Intégrations','API']},{h:'Support',links:['Documentation','Tutoriels','FAQ','Contact']}].map(col => (
                        <div key={col.h}>
                            <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:16 }}>{col.h}</div>
                            <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                                {col.links.map(l => <a key={l} href="#" style={{ fontSize:13, color:'#64748b', textDecoration:'none', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#6366f1'} onMouseLeave={e=>e.currentTarget.style.color='#64748b'}>{l}</a>)}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <p style={{ fontSize:12, color:'#cbd5e1' }}>© 2025 STATS ENQUETES. Tous droits réservés.</p>
                    <div style={{ display:'flex', gap:24 }}>
                        {['Confidentialité','CGU','Cookies'].map(l => <a key={l} href="#" style={{ fontSize:12, color:'#cbd5e1', textDecoration:'none', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#6366f1'} onMouseLeave={e=>e.currentTarget.style.color='#cbd5e1'}>{l}</a>)}
                    </div>
                </div>
            </footer>
        </>
    );
}