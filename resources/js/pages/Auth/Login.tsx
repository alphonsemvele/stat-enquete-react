import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    const fillDemo = () => {
        setData('email', 'demo@stat-enquete.com');
        setData('password', 'password');
    };

    return (
        <>
            <Head title="Connexion — STATS ENQUETES">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:300,400,500,600,700,800&family=bricolage-grotesque:700,800" rel="stylesheet" />
            </Head>

            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; }

                @keyframes float-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.96)} }
                @keyframes shimmer { from{background-position:-400px 0} to{background-position:400px 0} }
                @keyframes slide-in { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }

                .fade-up   { animation: float-up 0.5s ease both; }
                .fade-up-1 { animation: float-up 0.5s 0.08s ease both; }
                .fade-up-2 { animation: float-up 0.5s 0.16s ease both; }
                .fade-up-3 { animation: float-up 0.5s 0.24s ease both; }
                .fade-up-4 { animation: float-up 0.5s 0.32s ease both; }
                .fade-up-5 { animation: float-up 0.5s 0.40s ease both; }

                .blob { position:absolute; border-radius:50%; filter:blur(80px); animation:blob 16s ease-in-out infinite; pointer-events:none; }

                .input-wrap {
                    position: relative;
                }
                .input-field {
                    width: 100%;
                    background: #f8f7ff;
                    border: 1.5px solid #e8e4ff;
                    border-radius: 14px;
                    padding: 14px 16px;
                    font-size: 14px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: #1e1b4b;
                    outline: none;
                    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
                }
                .input-field::placeholder { color: #bbb0f0; }
                .input-field:focus {
                    border-color: #6366f1;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
                }
                .input-field.error {
                    border-color: #f43f5e;
                    background: #fff8f9;
                    box-shadow: 0 0 0 4px rgba(244,63,94,0.07);
                }
                .input-field.has-value { background: #fff; }

                .btn-main {
                    width: 100%;
                    background: linear-gradient(135deg, #6366f1 0%, #5254cc 100%);
                    color: white;
                    font-size: 15px;
                    font-weight: 700;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    padding: 15px;
                    border-radius: 14px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
                    box-shadow: 0 4px 20px rgba(99,102,241,0.3);
                    letter-spacing: 0.01em;
                    position: relative;
                    overflow: hidden;
                }
                .btn-main::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
                    pointer-events: none;
                }
                .btn-main:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(99,102,241,0.4);
                }
                .btn-main:active:not(:disabled) { transform: translateY(0); }
                .btn-main:disabled { opacity: 0.6; cursor: not-allowed; }

                .checkbox-custom {
                    width: 20px; height: 20px;
                    border-radius: 7px;
                    border: 1.5px solid #d4d0f5;
                    background: white;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .checkbox-custom.checked {
                    background: #6366f1;
                    border-color: #6366f1;
                }
                .checkbox-custom:hover { border-color: #6366f1; }

                .stat-item {
                    padding-left: 16px;
                    border-left: 2px solid rgba(255,255,255,0.2);
                    transition: border-color 0.2s;
                }
                .stat-item:hover { border-color: rgba(255,255,255,0.5); }

                .demo-badge {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px;
                    padding: 14px 18px;
                    backdrop-filter: blur(12px);
                }

                .left-panel {
                    background: linear-gradient(145deg, #6366f1 0%, #4f46e5 40%, #3730a3 100%);
                    position: relative;
                    overflow: hidden;
                }

                .left-panel-img {
                    position: absolute;
                    inset: 0;
                    object-fit: cover;
                    width: 100%;
                    height: 100%;
                    opacity: 0.07;
                    mix-blend-mode: luminosity;
                }

                .floating-card {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 16px;
                    padding: 16px 20px;
                    transition: all 0.3s;
                }
                .floating-card:hover {
                    background: rgba(255,255,255,0.15);
                    transform: translateY(-2px);
                }

                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #c4bff5;
                    transition: color 0.2s;
                    pointer-events: none;
                }
                .input-field:focus ~ .input-icon,
                .input-field.has-value ~ .input-icon { color: #6366f1; }

                .with-icon { padding-left: 44px; }

                .link-hover {
                    color: #6366f1;
                    font-weight: 600;
                    text-decoration: none;
                    position: relative;
                    transition: color 0.2s;
                }
                .link-hover::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 0;
                    height: 1px;
                    background: #6366f1;
                    transition: width 0.3s;
                }
                .link-hover:hover::after { width: 100%; }

                .divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #c4bff5;
                    font-size: 12px;
                    margin: 20px 0;
                }
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #ede9fe;
                }

                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 3px; }
            `}</style>

            <div style={{ minHeight:'100vh', display:'flex', background:'#f8f7ff' }}>

                {/* ── PANNEAU GAUCHE ────────────────────────────────────────────── */}
                <div className="left-panel" style={{ width:'52%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px 56px', position:'relative' }}>

                    {/* Image de fond */}
                    <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop"
                        alt=""
                        className="left-panel-img"
                    />

                    {/* Blobs */}
                    <div className="blob" style={{ width:400, height:400, top:-100, right:-100, background:'rgba(99,102,241,0.4)' }}/>
                    <div className="blob" style={{ width:300, height:300, bottom:-80, left:-60, background:'rgba(167,139,250,0.3)', animationDelay:'5s' }}/>
                    <div className="blob" style={{ width:200, height:200, top:'40%', right:'10%', background:'rgba(14,165,233,0.2)', animationDelay:'10s' }}/>

                    {/* Grille */}
                    <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize:'36px 36px' }}/>

                    {/* Logo */}
                    <div style={{ position:'relative', zIndex:1 }}>
                        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
                            <div style={{ width:38, height:38, borderRadius:13, background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                </svg>
                            </div>
                            <span style={{ fontFamily:'Bricolage Grotesque', fontWeight:800, fontSize:15, color:'white', letterSpacing:'-0.01em' }}>STATS ENQUETES</span>
                        </Link>
                    </div>

                    {/* Contenu central */}
                    <div style={{ position:'relative', zIndex:1 }}>
                      

                        <h2 style={{ fontFamily:'Bricolage Grotesque', fontSize:'clamp(2.8rem,4.5vw,4rem)', fontWeight:800, color:'white', lineHeight:1.0, letterSpacing:'-0.04em', marginBottom:20 }}>
                            Collectez.<br/>
                            Analysez.<br/>
                            <span style={{ background:'linear-gradient(135deg,#a5f3fc,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Décidez.</span>
                        </h2>

                        <p style={{ fontSize:16, color:'rgba(255,255,255,0.6)', lineHeight:1.75, maxWidth:340, marginBottom:40, fontWeight:400 }}>
                            Des enquêtes intelligentes pour des décisions éclairées. Rejoignez 15 000+ organisations africaines.
                        </p>

                        {/* Stats */}
                        <div style={{ display:'flex', gap:28, marginBottom:40 }}>
                            {[{n:'120K+',l:'Enquêtes'},{n:'8M+',l:'Réponses'},{n:'98%',l:'Satisfaction'}].map(s => (
                                <div key={s.n} className="stat-item">
                                    <div style={{ fontSize:26, fontWeight:800, fontFamily:'Bricolage Grotesque', color:'white', letterSpacing:'-0.03em', lineHeight:1 }}>{s.n}</div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:3 }}>{s.l}</div>
                                </div>
                            ))}
                        </div>

                        {/* Floating cards */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            {[
                                { icon:'📊', title:'Rapports live', desc:'Dashboards en temps réel' },
                                { icon:'🧠', title:'Analyse IA', desc:'Insights automatiques' },
                                { icon:'📡', title:'Distribution', desc:'Email, QR, lien direct' },
                                { icon:'🔒', title:'RGPD conforme', desc:'Données sécurisées EU' },
                            ].map(c => (
                                <div key={c.title} className="floating-card" style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <span style={{ fontSize:20 }}>{c.icon}</span>
                                    <div>
                                        <div style={{ fontSize:12, fontWeight:700, color:'white', fontFamily:'Bricolage Grotesque' }}>{c.title}</div>
                                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:1 }}>{c.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer gauche */}
                    <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.4)', fontSize:12 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        Données chiffrées · Hébergement EU · RGPD conforme
                    </div>
                </div>

                {/* ── PANNEAU DROIT ─────────────────────────────────────────────── */}
                <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 56px', background:'#f8f7ff', position:'relative', overflowY:'auto' }}>

                    {/* Décoration douce */}
                    <div style={{ position:'absolute', top:-100, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(99,102,241,0.05)', filter:'blur(60px)', pointerEvents:'none' }}/>
                    <div style={{ position:'absolute', bottom:-60, left:-40, width:240, height:240, borderRadius:'50%', background:'rgba(14,165,233,0.04)', filter:'blur(50px)', pointerEvents:'none' }}/>

                    <div style={{ maxWidth:400, width:'100%', margin:'0 auto', position:'relative', zIndex:1 }}>

                        {/* Header */}
                        <div className="fade-up" style={{ marginBottom:36 }}>
                            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px', borderRadius:100, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.14)', marginBottom:20 }}>
                                <span style={{ fontSize:11, fontWeight:600, color:'#6366f1', letterSpacing:'0.06em', textTransform:'uppercase' }}>Bienvenue</span>
                            </div>
                            <h1 style={{ fontFamily:'Bricolage Grotesque', fontSize:'2.4rem', fontWeight:800, color:'#1e1b4b', letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:10 }}>
                                Bon retour 👋
                            </h1>
                            <p style={{ fontSize:15, color:'#94a3b8', lineHeight:1.6 }}>
                                Connectez-vous pour accéder à votre espace
                            </p>
                        </div>

                        {status && (
                            <div className="fade-up" style={{ marginBottom:20, borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'14px 16px', fontSize:14, color:'#059669', display:'flex', alignItems:'center', gap:10 }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                {status}
                            </div>
                        )}

                        {/* Bannière démo */}
                        <div className="fade-up-1" style={{ marginBottom:28, borderRadius:16, background:'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(14,165,233,0.05) 100%)', border:'1px solid rgba(99,102,241,0.15)', padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                            <div>
                                <div style={{ fontSize:10, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Accès démo</div>
                                <div style={{ fontSize:12, color:'#64748b', display:'flex', flexDirection:'column', gap:3 }}>
                                    <span>Email : <code style={{ fontFamily:'monospace', fontWeight:600, color:'#1e1b4b', background:'rgba(99,102,241,0.08)', padding:'1px 6px', borderRadius:5 }}>demo@stat-enquete.com</code></span>
                                    <span>Mdp : <code style={{ fontFamily:'monospace', fontWeight:600, color:'#1e1b4b', background:'rgba(99,102,241,0.08)', padding:'1px 6px', borderRadius:5 }}>password</code></span>
                                </div>
                            </div>
                            <button type="button" onClick={fillDemo} style={{ flexShrink:0, background:'#6366f1', color:'white', border:'none', padding:'9px 16px', borderRadius:11, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Plus Jakarta Sans', transition:'all 0.2s', boxShadow:'0 3px 12px rgba(99,102,241,0.25)' }}
                                onMouseEnter={e=>{e.currentTarget.style.background='#5254cc';e.currentTarget.style.transform='translateY(-1px)';}}
                                onMouseLeave={e=>{e.currentTarget.style.background='#6366f1';e.currentTarget.style.transform='none';}}>
                                Remplir →
                            </button>
                        </div>

                        {/* Formulaire */}
                        <form onSubmit={submit}>

                            {/* Email */}
                            <div className="fade-up-2" style={{ marginBottom:16 }}>
                                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                                    Adresse email
                                </label>
                                <div className="input-wrap">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e=>setData('email',e.target.value)}
                                        onFocus={()=>setFocused('email')}
                                        onBlur={()=>setFocused(null)}
                                        placeholder="votre@email.com"
                                        autoFocus
                                        className={`input-field with-icon ${errors.email?'error':''} ${data.email?'has-value':''}`}
                                    />
                                    <svg className="input-icon" style={{ color: focused==='email'?'#6366f1': data.email?'#6366f1':'#c4bff5' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                                    </svg>
                                </div>
                                {errors.email && <p style={{ fontSize:12, color:'#f43f5e', fontWeight:500, marginTop:6, display:'flex', alignItems:'center', gap:5 }}>
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    {errors.email}
                                </p>}
                            </div>

                            {/* Mot de passe */}
                            <div className="fade-up-3" style={{ marginBottom:8 }}>
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                                    <label style={{ fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                                        Mot de passe
                                    </label>
                                    <a href="/forgot-password" className="link-hover" style={{ fontSize:12, color:'#6366f1' }}>
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                                <div className="input-wrap" style={{ position:'relative' }}>
                                    <input
                                        type={showPass?'text':'password'}
                                        value={data.password}
                                        onChange={e=>setData('password',e.target.value)}
                                        onFocus={()=>setFocused('password')}
                                        onBlur={()=>setFocused(null)}
                                        placeholder="••••••••"
                                        className={`input-field with-icon ${errors.password?'error':''} ${data.password?'has-value':''}`}
                                        style={{ paddingRight:46 }}
                                    />
                                    <svg className="input-icon" style={{ color: focused==='password'?'#6366f1': data.password?'#6366f1':'#c4bff5' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                    </svg>
                                    <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#c4bff5', transition:'color 0.2s', padding:0 }}
                                        onMouseEnter={e=>e.currentTarget.style.color='#6366f1'}
                                        onMouseLeave={e=>e.currentTarget.style.color='#c4bff5'}>
                                        {showPass
                                            ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                                            : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                        }
                                    </button>
                                </div>
                                {errors.password && <p style={{ fontSize:12, color:'#f43f5e', fontWeight:500, marginTop:6, display:'flex', alignItems:'center', gap:5 }}>
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    {errors.password}
                                </p>}
                            </div>

                            {/* Remember */}
                            <div className="fade-up-4" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, marginTop:18, cursor:'pointer' }} onClick={()=>setData('remember',!data.remember)}>
                                <div className={`checkbox-custom ${data.remember?'checked':''}`}>
                                    {data.remember && (
                                        <svg width="11" height="11" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                    )}
                                </div>
                                <input type="checkbox" checked={data.remember} onChange={e=>setData('remember',e.target.checked)} style={{ display:'none' }}/>
                                <span style={{ fontSize:14, color:'#64748b', userSelect:'none' }}>Se souvenir de moi</span>
                            </div>

                            {/* Submit */}
                            <div className="fade-up-5">
                                <button type="submit" disabled={processing} className="btn-main">
                                    {processing ? (
                                        <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ animation:'spin 0.8s linear infinite' }}>
                                                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                                                <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            Connexion en cours…
                                        </span>
                                    ) : (
                                        <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                                            Se connecter
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                                        </span>
                                    )}
                                </button>

                                <p style={{ textAlign:'center', fontSize:14, color:'#94a3b8', marginTop:20 }}>
                                    Pas encore de compte ?{' '}
                                    <a href="/register" className="link-hover">Créer un compte gratuit</a>
                                </p>
                            </div>
                        </form>

                        {/* Retour */}
                        <div style={{ marginTop:40, textAlign:'center' }}>
                            <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'#94a3b8', textDecoration:'none', transition:'color 0.2s' }}
                                onMouseEnter={e=>e.currentTarget.style.color='#6366f1'}
                                onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}