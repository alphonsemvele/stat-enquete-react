import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [copied, setCopied] = useState<string>('');
    const [activeFeature, setActiveFeature] = useState<number>(0);

    const toggleFaq = (index: number): void => {
        setOpenFaq(prev => prev === index ? null : index);
    };

    const handleCopy = (text: string, key: string): void => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    const features = [
        { title: 'Éditeur visuel', desc: 'Construisez vos enquêtes par glisser-déposer. 20+ types de champs, aperçu instantané, aucun code requis.', detail: 'Texte libre, choix multiples, échelles, NPS, matrices, fichiers joints et bien plus encore.' },
        { title: 'Analyse IA', desc: 'Notre moteur d\'intelligence artificielle détecte les tendances et génère des insights au fil des réponses.', detail: 'Résumés automatiques, détection d\'anomalies, analyse de sentiment, prédictions en temps réel.' },
        { title: 'Distribution multicanal', desc: 'Atteignez vos cibles par email, lien direct, QR code, widget embarqué ou intégration API.', detail: 'Personnalisation de l\'expédition, relances automatiques, suivi des ouvertures et des clics.' },
        { title: 'Rapports & exports', desc: 'Des dashboards dynamiques mis à jour en continu. Exportez en PDF, Excel ou partagez un lien live.', detail: 'Graphiques interactifs, filtres avancés, comparaisons temporelles, exports programmés.' },
        { title: 'Logique avancée', desc: 'Créez des parcours adaptatifs selon les réponses pour une expérience répondant optimale.', detail: 'Branchements conditionnels, sauts de sections, calculs dynamiques, personnalisation du contenu.' },
        { title: 'Sécurité RGPD', desc: 'Chiffrement de bout en bout, anonymisation native et hébergement conforme aux réglementations.', detail: 'Gestion des consentements, droit à l\'oubli, journaux d\'audit, hébergement en Europe.' },
    ];

    return (
        <>
            <Head title="STATS ENQUETES — Enquêtes intelligentes" />

            <div className="min-h-screen bg-white text-[#0f172a]">

                {/* ─── NAVBAR ─── */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                    <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="font-bold text-[#0f172a] text-lg tracking-tight">STATS ENQUETES</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            {[['Fonctionnalités', '#features'], ['Modèles', '#modeles'], ['Démo', '#demo']].map(([label, href]) => (
                                <a key={label} href={href} className="text-sm text-slate-500 hover:text-[#2563eb] transition-colors font-medium">{label}</a>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-[#2563eb] transition-colors px-3 py-2">Connexion</Link>
                            <Link href="/login" className="text-sm font-semibold bg-[#2563eb] text-white px-5 py-2.5 rounded-xl hover:bg-[#1d4ed8] transition-colors">Démarrer gratuitement</Link>
                        </div>
                    </div>
                </nav>

                {/* ─── HERO ─── */}
                <section className="pt-32 pb-0 px-6 overflow-hidden">
                    <div className="mx-auto max-w-7xl">
                       
                        <div className="text-center max-w-5xl mx-auto">
                            <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight text-[#0f172a]">
                                Des enquêtes qui transforment{' '}
                                <span className="relative whitespace-nowrap">
                                    <span className="relative z-10 text-[#2563eb]">vos données</span>
                                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 400 12" fill="none" preserveAspectRatio="none">
                                        <path d="M2 9 Q100 2 200 7 Q300 12 398 5" stroke="#bfdbfe" strokeWidth="4" strokeLinecap="round" fill="none"/>
                                    </svg>
                                </span>{' '}
                                en décisions
                            </h1>
                            <p className="mt-7 text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-normal">
                                Créez, distribuez et analysez des enquêtes professionnelles en quelques minutes.
                            
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                            <Link href="/login" className="inline-flex items-center gap-2 bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#1d4ed8] transition-all hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-0.5">
                                Créer mon enquête
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                            </Link>
                            <a href="#demo" className="inline-flex items-center gap-2 text-slate-600 font-semibold px-8 py-4 rounded-xl text-base border-2 border-slate-200 hover:border-blue-200 hover:text-[#2563eb] transition-all bg-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Voir la démo
                            </a>
                        </div>
                        <div className="mt-16 border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                            {[{ n: '120 000+', l: 'Enquêtes créées' }, { n: '8 millions+', l: 'Réponses collectées' }, { n: '98 %', l: 'Clients satisfaits' }].map(s => (
                                <div key={s.n} className="py-8 text-center">
                                    <div className="text-3xl font-extrabold text-[#2563eb]">{s.n}</div>
                                    <div className="text-sm text-slate-400 mt-1 font-medium">{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── TRUST BAR ─── */}
                <div className="bg-slate-50 border-y border-slate-100 py-8 px-6">
                    <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-6">
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Ils nous font confiance</span>
                        <div className="flex flex-wrap gap-10 opacity-40">
                            {['Université de Douala', 'Ministère Santé', 'BancAfrique', 'Orange CI', 'Groupe Cebar'].map(o => (
                                <span key={o} className="text-sm font-bold text-slate-600">{o}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── FEATURES ─── */}
                <section id="features" className="py-28 px-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-slate-100">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3">Fonctionnalités</p>
                                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
                                    Tout ce qu'il faut<br />pour réussir
                                </h2>
                            </div>
                            <p className="text-slate-500 max-w-xs leading-relaxed text-base">
                                De la création à l'analyse, STATS ENQUETES couvre chaque étape avec précision.
                            </p>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-0">
                            <div className="border-r border-slate-100">
                                {features.map((f, i) => (
                                    <button key={i} onClick={() => setActiveFeature(i)} className={`w-full text-left p-7 border-b border-slate-100 transition-all group ${activeFeature === i ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${activeFeature === i ? 'text-[#2563eb]' : 'text-slate-400'}`}>0{i + 1}</div>
                                                <h3 className={`text-lg font-bold transition-colors ${activeFeature === i ? 'text-[#2563eb]' : 'text-[#0f172a] group-hover:text-[#2563eb]'}`}>{f.title}</h3>
                                                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{f.desc}</p>
                                            </div>
                                            <svg className={`w-5 h-5 mt-1 flex-shrink-0 transition-all ${activeFeature === i ? 'text-[#2563eb] translate-x-1' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="hidden lg:flex flex-col justify-center p-14 bg-slate-50 sticky top-16 h-fit">
                                <div className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-4">0{activeFeature + 1} / 06</div>
                                <h3 className="text-3xl font-extrabold text-[#0f172a] mb-5">{features[activeFeature].title}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6 text-base">{features[activeFeature].desc}</p>
                                <div className="bg-white border border-blue-100 rounded-xl p-5">
                                    <p className="text-sm text-slate-600 leading-relaxed">{features[activeFeature].detail}</p>
                                </div>
                                <Link href="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:gap-3 transition-all">
                                    En savoir plus
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── TEMPLATES ─── */}
                <section id="modeles" className="py-28 px-6 bg-[#0f172a]">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#60a5fa] mb-4">100+ modèles</p>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
                                    Partez d'un modèle,<br /><span className="text-[#60a5fa]">personnalisez tout</span>
                                </h2>
                                <p className="text-slate-400 leading-relaxed text-base mb-8">
                                    Ne démarrez jamais d'une page blanche. Notre bibliothèque couvre RH, santé, éducation, marketing et recherche académique.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-10">
                                    {['Satisfaction client', 'Enquête RH', 'Feedback produit', 'NPS', 'Quiz', 'Recherche', 'Sondage', 'Évaluation'].map(t => (
                                        <span key={t} className="text-xs font-medium text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-400 transition-colors cursor-default">{t}</span>
                                    ))}
                                </div>
                                <Link href="/login" className="inline-flex items-center gap-2 bg-[#2563eb] text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-[#1d4ed8] transition-all">
                                    Explorer les modèles →
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { title: 'Satisfaction client', q: '8 questions', r: '2 400 rép.', color: '#3b82f6' },
                                    { title: 'Enquête RH annuelle', q: '15 questions', r: '856 rép.', color: '#a78bfa' },
                                    { title: 'Feedback produit', q: '6 questions', r: '4 100 rép.', color: '#34d399' },
                                    { title: 'NPS Score', q: '3 questions', r: '12K rép.', color: '#fb923c' },
                                ].map((tpl, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="w-8 h-1 rounded-full mb-4" style={{ background: tpl.color }}></div>
                                        <h4 className="font-bold text-white text-sm mb-3">{tpl.title}</h4>
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>{tpl.q}</span>
                                            <span className="font-semibold" style={{ color: tpl.color }}>{tpl.r}</span>
                                        </div>
                                        <div className="mt-3 text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Utiliser →</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── DEMO ─── */}
                <section id="demo" className="py-28 px-6 bg-white">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-4">Accès gratuit immédiat</p>
                                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0f172a] leading-tight mb-6">
                                    Testez STATS ENQUETES<br />sans engagement
                                </h2>
                                <p className="text-slate-500 leading-relaxed text-base mb-8">
                                    Explorez la plateforme complète avec des données de démonstration. Aucune carte bancaire requise.
                                </p>
                                <div className="space-y-4">
                                    {['Éditeur complet déverrouillé', 'Tableau de bord analytique avec données test', 'Toutes les intégrations actives', 'Aucune carte bancaire requise'].map(item => (
                                        <div key={item} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                            </div>
                                            <span className="text-slate-600 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="border-2 border-slate-100 rounded-3xl p-8 bg-white shadow-2xl shadow-slate-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-2xl flex items-center justify-center">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-[#0f172a]">Compte de démonstration</h3>
                                            <p className="text-sm text-slate-400">Prêt à l'emploi</p>
                                        </div>
                                    </div>
                                    {[{ label: 'Email', value: 'demo@stat-enquete.io', key: 'email' }, { label: 'Mot de passe', value: 'password', key: 'pwd' }].map(cred => (
                                        <div key={cred.key} className="mb-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{cred.label}</div>
                                            <div className="flex items-center justify-between">
                                                <code className="font-mono font-semibold text-[#0f172a] text-sm">{cred.value}</code>
                                                <button onClick={() => handleCopy(cred.value, cred.key)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-blue-300 hover:text-[#2563eb] transition-all text-slate-400">
                                                    {copied === cred.key
                                                        ? <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                                                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                                        <p className="text-xs text-blue-600">Environnement isolé avec données fictives. Aucune modification n'est persistée.</p>
                                    </div>
                                    <Link href="/login" className="w-full flex items-center justify-center gap-2 bg-[#2563eb] text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-[#1d4ed8] transition-all">
                                        Accéder à la démo
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── TESTIMONIALS ─── */}
                <section className="py-28 px-6 bg-slate-50">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-slate-200">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3">Témoignages</p>
                                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0f172a]">Ce qu'ils en disent</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-[#2563eb]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-slate-600">4.9/5 — 2 000+ avis</span>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { name: 'Dr. Aminata Diallo', role: 'Chercheuse, UAC Bénin', quote: 'STATS ENQUETES a transformé notre collecte terrain. L\'IA donne des insights en temps réel impossibles à obtenir manuellement.', init: 'AD', color: 'bg-blue-500' },
                                { name: 'Marc-Antoine Essomba', role: 'DRH, Groupe Cebar', quote: '87% de taux de réponse sur nos enquêtes internes. Nos équipes adorent l\'interface. C\'est devenu un outil central.', init: 'ME', color: 'bg-indigo-500' },
                                { name: 'Fatoumata Kouyaté', role: 'Marketing, Orange CI', quote: 'On économise des heures de reporting chaque semaine. Les exports automatiques et les dashboards live sont vraiment impressionnants.', init: 'FK', color: 'bg-sky-500' },
                            ].map((t, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-lg hover:shadow-slate-100 transition-all">
                                    <div className="flex gap-1 mb-5">
                                        {[...Array(5)].map((_, si) => (<svg key={si} className="w-4 h-4 text-[#2563eb]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>))}
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                                    <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                                        <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center text-white text-xs font-bold`}>{t.init}</div>
                                        <div>
                                            <div className="font-bold text-sm text-[#0f172a]">{t.name}</div>
                                            <div className="text-xs text-slate-400">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

             

                {/* ─── FAQ ─── */}
                <section className="py-28 px-6 bg-slate-50">
                    <div className="mx-auto max-w-3xl">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3">FAQ</p>
                            <h2 className="text-4xl font-extrabold tracking-tight text-[#0f172a]">Questions fréquentes</h2>
                        </div>
                        <div className="space-y-2">
                            {[
                                { q: 'Combien de temps pour créer ma première enquête ?', a: 'Moins de 5 minutes avec nos modèles. Choisissez, personnalisez, partagez.' },
                                { q: 'Mes données sont-elles sécurisées ?', a: 'Chiffrement AES-256, serveurs certifiés ISO 27001, conformité RGPD complète. Vos données ne sont jamais revendues.' },
                                { q: 'L\'analyse IA supporte quelles langues ?', a: 'Français, anglais, espagnol, arabe et portugais. D\'autres langues sont en cours d\'intégration.' },
                                { q: 'Puis-je intégrer STATS ENQUETES à mes outils ?', a: 'Oui via notre API REST ou nos intégrations natives Zapier, Google Sheets, Notion, Slack et HubSpot.' },
                                { q: 'Que se passe-t-il après la période d\'essai ?', a: 'Passage automatique en version Gratuite. Aucun prélèvement sans votre accord. Vous conservez vos données.' },
                            ].map((faq, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                    <button onClick={() => toggleFaq(i)} className="w-full flex items-center justify-between p-6 text-left">
                                        <span className="font-semibold text-[#0f172a] text-sm">{faq.q}</span>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-colors ${openFaq === i ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <svg className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                                        </div>
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4">{faq.a}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── CTA FINAL ─── */}
                <section className="py-28 px-6 bg-white">
                    <div className="mx-auto max-w-4xl">
                        <div className="bg-[#0f172a] rounded-3xl p-16 text-center relative overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-5">Prêt à commencer ?</p>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                                    Créez votre première<br /><span className="text-[#60a5fa]">enquête maintenant</span>
                                </h2>
                                <p className="text-slate-400 text-base mb-10">15 000+ organisations nous font confiance. Rejoignez-les en 2 minutes.</p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Link href="/login" className="bg-[#2563eb] text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#1d4ed8] transition-all">Créer un compte gratuit</Link>
                                    <a href="#demo" className="bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/20 hover:bg-white/15 transition-all">Voir la démonstration</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FOOTER ─── */}
                <footer className="border-t border-slate-100 bg-white px-6 py-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                    </div>
                                    <span className="font-bold text-[#0f172a] text-lg">STATS ENQUETES</span>
                                </div>
                                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">La plateforme d'enquête moderne pour collecter, analyser et agir sur vos données.</p>
                            </div>
                            {[
                                { h: 'Produit', links: ['Fonctionnalités', 'Modèles', 'Intégrations', 'API'] },
                                { h: 'Support', links: ['Documentation', 'Tutoriels', 'FAQ', 'Contact', 'Statut'] },
                            ].map(col => (
                                <div key={col.h}>
                                    <h5 className="font-bold text-[#0f172a] mb-4 text-sm">{col.h}</h5>
                                    <ul className="space-y-2.5">
                                        {col.links.map(l => (<li key={l}><a href="#" className="text-sm text-slate-400 hover:text-[#2563eb] transition-colors">{l}</a></li>))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-sm text-slate-400">
                            <p>© 2025 STATS ENQUETES. Tous droits réservés.</p>
                            <div className="flex gap-6">
                                {['Confidentialité', 'CGU', 'Cookies'].map(l => (<a key={l} href="#" className="hover:text-[#2563eb] transition-colors">{l}</a>))}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}