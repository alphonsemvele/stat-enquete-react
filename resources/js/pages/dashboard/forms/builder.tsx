import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../dashboard/layout';

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldSize = 'h1' | 'h2' | 'h3';
type MobileTab = 'questions' | 'editor' | 'properties';

interface QProps {
    label?: string; placeholder?: string; required?: boolean;
    maxLength?: string; rows?: string; min?: string; max?: string;
    options?: string; accept?: string;
    title?: string; subtitle?: string; size?: FieldSize;
    [key: string]: unknown;
}

interface Question { type: string; properties: QProps; }

interface FormMeta {
    id: number | null; title: string;
    reference: string | null; is_published: boolean;
}

interface Props { form?: FormMeta; questions?: Question[]; }

type ComponentDef   = { type: string; label: string; props: QProps; };
type ComponentGroup = { group: string; items: ComponentDef[] };

// ─── Config composants ───────────────────────────────────────────────────────

const GROUPS: ComponentGroup[] = [
    {
        group: 'Texte',
        items: [
            { type: 'text_input',   label: 'Texte court',  props: { label: 'Votre question', placeholder: 'Réponse courte…',  required: false, maxLength: '' } },
            { type: 'textarea',     label: 'Texte long',   props: { label: 'Votre question', placeholder: 'Réponse longue…',  required: false, rows: '4' } },
            { type: 'number_input', label: 'Nombre',       props: { label: 'Votre question', placeholder: '0',                required: false, min: '', max: '' } },
            { type: 'email',        label: 'Email',        props: { label: 'Adresse email',  placeholder: 'nom@exemple.com',  required: false } },
            { type: 'phone',        label: 'Téléphone',    props: { label: 'Numéro de tél.', placeholder: '+237 6XX XXX XXX', required: false } },
        ],
    },
    {
        group: 'Choix',
        items: [
            { type: 'dropdown', label: 'Liste déroulante', props: { label: 'Votre question', placeholder: 'Choisissez…', required: false, options: 'Option 1, Option 2, Option 3' } },
            { type: 'radio',    label: 'Choix unique',     props: { label: 'Votre question', required: false, options: 'Option 1, Option 2, Option 3' } },
            { type: 'checkbox', label: 'Case à cocher',    props: { label: 'Votre question', required: false } },
        ],
    },
    {
        group: 'Avancé',
        items: [
            { type: 'date_picker', label: 'Date',       props: { label: 'Sélectionnez une date', required: false } },
            { type: 'file_upload', label: 'Fichier',    props: { label: 'Joindre un fichier',    required: false, accept: '' } },
            { type: 'block_title', label: 'Titre/Bloc', props: { title: 'Section', subtitle: '', size: 'h2' as FieldSize } },
        ],
    },
];

const ALL_COMPONENTS: ComponentDef[] = GROUPS.flatMap(g => g.items);

const TYPE_LABEL: Record<string, string> = {
    text_input:'Texte court', textarea:'Texte long', number_input:'Nombre',
    email:'Email', phone:'Téléphone', dropdown:'Liste', radio:'Choix unique',
    checkbox:'Case à cocher', date_picker:'Date', file_upload:'Fichier', block_title:'Titre',
};

function TypeIcon({ type, cls = 'w-3.5 h-3.5' }: { type: string; cls?: string }) {
    const p = { className: cls, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' };
    switch(type) {
        case 'text_input':   return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8"/></svg>;
        case 'textarea':     return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h12"/></svg>;
        case 'number_input': return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>;
        case 'email':        return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
        case 'phone':        return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
        case 'dropdown':     return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>;
        case 'radio':        return <svg {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2}/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>;
        case 'checkbox':     return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
        case 'date_picker':  return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2v12a2 2 0 002 2z"/></svg>;
        case 'file_upload':  return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>;
        case 'block_title':  return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10"/></svg>;
        default:             return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8"/></svg>;
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FormBuilder({ form, questions: init = [] }: Props) {
    const [formId,      setFormId]      = useState<number | null>(form?.id ?? null);
    const [title,       setTitle]       = useState(form?.title ?? 'Nouveau formulaire');
    const [editTitle,   setEditTitle]   = useState(false);
    const [reference,   setReference]   = useState(form?.reference ?? null);
    const [questions,   setQuestions]   = useState<Question[]>(init);
    const [selIdx,      setSelIdx]      = useState<number | null>(null);
    const [preview,     setPreview]     = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [publishing,  setPublishing]  = useState(false);
    const [flash,       setFlash]       = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
    const [showPalette, setShowPalette] = useState(false);
    const [paletteQ,    setPaletteQ]    = useState('');
    // Onglet mobile actif
    const [mobileTab,   setMobileTab]   = useState<MobileTab>('questions');

    const titleRef   = useRef<HTMLInputElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (editTitle) titleRef.current?.select(); }, [editTitle]);
    useEffect(() => {
        if (!flash) return;
        const t = setTimeout(() => setFlash(null), 4000);
        return () => clearTimeout(t);
    }, [flash]);
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (paletteRef.current && !paletteRef.current.contains(e.target as Node))
                setShowPalette(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const ok  = (msg: string) => setFlash({ type: 'ok',  msg });
    const err = (msg: string) => setFlash({ type: 'err', msg });

    // ── CRUD ─────────────────────────────────────────────────────────────────
    const add = (type: string) => {
        const comp = ALL_COMPONENTS.find(c => c.type === type);
        if (!comp) return;
        const updated = [...questions, { type, properties: { ...comp.props } }];
        setQuestions(updated);
        const newIdx = updated.length - 1;
        setSelIdx(newIdx);
        setShowPalette(false);
        setPaletteQ('');
        // Sur mobile, basculer sur l'onglet éditeur après l'ajout
        setMobileTab('editor');
    };

    const remove = (i: number) => {
        setQuestions(q => q.filter((_, idx) => idx !== i));
        setSelIdx(s => s === i ? null : s !== null && s > i ? s - 1 : s);
    };

    const dupe = (i: number) => {
        const copy = { ...questions[i], properties: { ...questions[i].properties } };
        setQuestions(q => [...q, copy]);
        setSelIdx(questions.length);
    };

    const moveUp = (i: number) => {
        if (i === 0) return;
        setQuestions(q => { const n = [...q]; [n[i-1],n[i]]=[n[i],n[i-1]]; return n; });
        setSelIdx(s => s===i ? i-1 : s===i-1 ? i : s);
    };

    const moveDown = (i: number) => {
        if (i >= questions.length - 1) return;
        setQuestions(q => { const n=[...q]; [n[i],n[i+1]]=[n[i+1],n[i]]; return n; });
        setSelIdx(s => s===i ? i+1 : s===i+1 ? i : s);
    };

    const setProp = (i: number, key: string, val: unknown) =>
        setQuestions(q => q.map((x, idx) =>
            idx === i ? { ...x, properties: { ...x.properties, [key]: val } } : x
        ));

    // Sélection + bascule automatique vers l'éditeur sur mobile
    const selectQuestion = (i: number) => {
        setSelIdx(i);
        setMobileTab('editor');
    };

    // ── Save / Publish ────────────────────────────────────────────────────────
    const save = () => {
        setSaving(true);
        router.post('/enquetes/save', { formId, title, questions } as any, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const data = page.props.saved;
                if (data) { setFormId(data.id); setReference(data.reference); }
                ok('Formulaire enregistré !');
            },
            onError: () => err("Erreur lors de l'enregistrement."),
            onFinish: () => setSaving(false),
        });
    };

    const publish = () => {
        setPublishing(true);
        router.post('/enquetes/publish', { formId, title, questions } as any, {
            preserveScroll: true,
            onSuccess: () => ok('Formulaire publié !'),
            onError: () => err('Erreur lors de la publication.'),
            onFinish: () => setPublishing(false),
        });
    };

    const sel = selIdx !== null ? questions[selIdx] : null;
    const filteredGroups = GROUPS.map(g => ({
        ...g,
        items: g.items.filter(c => c.label.toLowerCase().includes(paletteQ.toLowerCase())),
    })).filter(g => g.items.length > 0);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout title="" subtitle="">
            <Head title={`${title} — STATS ENQUETES`} />

            {/* ── TOPBAR ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-5 bg-white rounded-2xl border border-slate-100 px-4 sm:px-5 py-3 sm:py-3.5">

                {/* Ligne 1 : titre + statut */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </div>
                    {editTitle ? (
                        <input ref={titleRef} value={title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={() => { setEditTitle(false); setTitle(t => t.trim() || 'Nouveau formulaire'); }}
                            onKeyDown={e => ['Enter','Escape'].includes(e.key) && (e.target as HTMLInputElement).blur()}
                            className="flex-1 text-sm sm:text-base font-bold text-[#0f172a] bg-transparent border-0 border-b-2 border-[#2563eb] outline-none focus:ring-0 min-w-0"
                        />
                    ) : (
                        <button onClick={() => setEditTitle(true)} className="flex items-center gap-2 group min-w-0 flex-1">
                            <span className="text-sm sm:text-base font-bold text-[#0f172a] group-hover:text-[#2563eb] transition-colors truncate">{title}</span>
                            <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#2563eb] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0111 14H9v-2a2 2 0 01.586-1.414z"/>
                            </svg>
                        </button>
                    )}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {formId ? (
                            <>
                                <span className="text-xs font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full">Enregistré</span>
                                {reference && <span className="hidden lg:inline text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full select-all">{reference}</span>}
                            </>
                        ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full">Non enregistré</span>
                        )}
                    </div>
                </div>

                {/* Ligne 2 / Droite : actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                    <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex-shrink-0">
                        {questions.length} champ{questions.length !== 1 ? 's' : ''}
                    </span>
                    <button onClick={() => setPreview(true)} className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-blue-200 hover:text-[#2563eb] transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        <span className="hidden sm:inline">Aperçu</span>
                    </button>
                    <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-blue-200 hover:text-[#2563eb] transition-all disabled:opacity-50">
                        {saving ? <Spin /> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>}
                        {saving ? 'Sauvegarde…' : 'Enregistrer'}
                    </button>
                    <button onClick={publish} disabled={publishing} className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold bg-[#2563eb] text-white rounded-xl hover:bg-[#1d4ed8] transition-all disabled:opacity-50">
                        {publishing ? <Spin white /> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>}
                        {publishing ? 'Publication…' : 'Publier'}
                    </button>
                </div>
            </div>

            {/* Flash */}
            {flash && (
                <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${flash.type==='ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {flash.type==='ok'
                        ? <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        : <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>}
                    {flash.msg}
                </div>
            )}

            {/* ── ONGLETS MOBILE (< lg) ─────────────────────────────────── */}
            <div className="lg:hidden flex items-center gap-1 mb-3 bg-white rounded-2xl border border-slate-100 p-1.5">
                {([
                    { key: 'questions',  label: 'Questions', badge: questions.length },
                    { key: 'editor',     label: 'Éditeur',   badge: null },
                    { key: 'properties', label: 'Propriétés',badge: null },
                ] as { key: MobileTab; label: string; badge: number | null }[]).map(tab => (
                    <button key={tab.key} onClick={() => setMobileTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${mobileTab === tab.key ? 'bg-[#2563eb] text-white shadow-sm' : 'text-slate-400 hover:text-[#0f172a]'}`}>
                        {tab.label}
                        {tab.badge !== null && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${mobileTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── LAYOUT ───────────────────────────────────────────────────
                Mobile : panneau unique selon mobileTab
                lg+    : 3 colonnes fixes
            ─────────────────────────────────────────────────────────────── */}
            <div className="lg:flex lg:gap-5" style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}>

                {/* ── SIDEBAR GAUCHE : Questions ───────────────────────── */}
                <div className={`
                    lg:w-72 lg:flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden
                    ${mobileTab === 'questions' ? 'flex' : 'hidden lg:flex'}
                    h-full
                `}>
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions</span>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{questions.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2">
                        {questions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                </div>
                                <p className="text-xs font-medium text-slate-400 mb-0.5">Aucun champ</p>
                                <p className="text-xs text-slate-300">Cliquez sur + pour commencer</p>
                            </div>
                        ) : questions.map((q, i) => (
                            <button key={i} onClick={() => selectQuestion(i)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2 ${
                                    selIdx === i
                                        ? 'bg-blue-50 border-[#2563eb]'
                                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }`}>
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${selIdx === i ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {i + 1}
                                </span>
                                <span className={`flex-shrink-0 ${selIdx === i ? 'text-[#2563eb]' : 'text-slate-400'}`}>
                                    <TypeIcon type={q.type} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold truncate ${selIdx === i ? 'text-[#2563eb]' : 'text-[#0f172a]'}`}>
                                        {q.type === 'block_title' ? (q.properties.title || 'Titre') : (q.properties.label || 'Sans titre')}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{TYPE_LABEL[q.type] ?? q.type}</p>
                                </div>
                                {q.properties.required && <span className="text-red-400 text-xs flex-shrink-0 font-bold">*</span>}
                            </button>
                        ))}
                    </div>

                    {/* Bouton + palette */}
                    <div className="p-3 border-t border-slate-100 relative" ref={paletteRef}>
                        <button onClick={() => setShowPalette(p => !p)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                            Ajouter un champ
                        </button>

                        {showPalette && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200 z-20 overflow-hidden">
                                <div className="p-3 border-b border-slate-100">
                                    <div className="relative">
                                        <input autoFocus value={paletteQ} onChange={e => setPaletteQ(e.target.value)}
                                            placeholder="Chercher un champ…"
                                            className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 focus:border-[#2563eb] focus:outline-none transition-all"
                                        />
                                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2">
                                    {filteredGroups.map(g => (
                                        <div key={g.group} className="mb-3 last:mb-0">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-1.5">{g.group}</p>
                                            {g.items.map(item => (
                                                <button key={item.type} onClick={() => add(item.type)}
                                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-blue-50 transition-all group">
                                                    <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 text-slate-500 group-hover:text-[#2563eb] transition-colors">
                                                        <TypeIcon type={item.type} />
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-600 group-hover:text-[#2563eb] transition-colors">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                    {filteredGroups.length === 0 && <p className="text-xs text-center text-slate-400 py-4">Aucun résultat</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── CENTRE : éditeur ─────────────────────────────────── */}
                <div className={`
                    flex-1 flex flex-col overflow-hidden
                    ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'}
                    h-full
                `}>
                    {sel && selIdx !== null ? (
                        <div className="flex-1 overflow-y-auto">
                            <div className="bg-white rounded-2xl border-2 border-[#2563eb] shadow-lg shadow-blue-50 p-5 sm:p-8 mb-4">
                                {/* Header éditeur */}
                                <div className="flex items-center justify-between mb-5 sm:mb-6 gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="w-7 h-7 rounded-lg bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{selIdx + 1}</span>
                                        <span className="text-xs font-semibold text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-full">{TYPE_LABEL[sel.type] ?? sel.type}</span>
                                        {sel.properties.required && <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">Obligatoire</span>}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => moveUp(selIdx)} disabled={selIdx === 0}
                                            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 disabled:opacity-30 transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/></svg>
                                        </button>
                                        <button onClick={() => moveDown(selIdx)} disabled={selIdx === questions.length - 1}
                                            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 disabled:opacity-30 transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                        <button onClick={() => dupe(selIdx)}
                                            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-[#2563eb] transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                        </button>
                                        {/* Raccourci vers propriétés sur mobile */}
                                        <button onClick={() => setMobileTab('properties')}
                                            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-[#2563eb] transition-colors lg:hidden">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                                        </button>
                                        <button onClick={() => remove(selIdx)}
                                            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Édition inline */}
                                {sel.type === 'block_title' ? (
                                    <div>
                                        <input value={sel.properties.title ?? ''}
                                            onChange={e => setProp(selIdx, 'title', e.target.value)}
                                            placeholder="Titre de la section…"
                                            className={`w-full font-bold text-[#0f172a] bg-transparent border-0 border-b-2 border-slate-100 hover:border-slate-200 focus:border-[#2563eb] outline-none focus:ring-0 pb-1 placeholder-slate-300 ${sel.properties.size==='h1' ? 'text-3xl' : sel.properties.size==='h3' ? 'text-lg' : 'text-2xl'}`}
                                        />
                                        <input value={sel.properties.subtitle ?? ''}
                                            onChange={e => setProp(selIdx, 'subtitle', e.target.value)}
                                            placeholder="Sous-titre (optionnel)…"
                                            className="w-full text-sm text-slate-400 bg-transparent border-0 outline-none focus:ring-0 placeholder-slate-300 mt-2"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <input value={sel.properties.label ?? ''}
                                            onChange={e => setProp(selIdx, 'label', e.target.value)}
                                            placeholder="Écrivez votre question ici…"
                                            className="w-full text-lg sm:text-xl font-semibold text-[#0f172a] bg-transparent border-0 border-b-2 border-slate-100 hover:border-slate-200 focus:border-[#2563eb] outline-none focus:ring-0 pb-1 placeholder-slate-300 mb-5 sm:mb-6"
                                        />
                                        <LivePreview question={sel} interactive />
                                    </div>
                                )}
                            </div>

                            {/* Navigation précédent / suivant */}
                            <div className="flex items-center justify-between px-1">
                                <button onClick={() => selIdx > 0 && setSelIdx(selIdx - 1)} disabled={selIdx === 0}
                                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#2563eb] disabled:opacity-30 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                                    Précédente
                                </button>
                                <span className="text-xs text-slate-400 font-medium">{selIdx + 1} / {questions.length}</span>
                                <button onClick={() => selIdx < questions.length - 1 && setSelIdx(selIdx + 1)} disabled={selIdx === questions.length - 1}
                                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#2563eb] disabled:opacity-30 transition-colors">
                                    Suivante
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="text-center max-w-xs px-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0111 14H9v-2a2 2 0 01.586-1.414z"/>
                                    </svg>
                                </div>
                                {questions.length === 0 ? (
                                    <>
                                        <p className="text-sm font-semibold text-slate-500 mb-1">Formulaire vide</p>
                                        <p className="text-xs text-slate-400 mb-5">
                                            <span className="lg:hidden">Allez dans <strong>Questions</strong> et cliquez sur + pour commencer.</span>
                                            <span className="hidden lg:inline">Cliquez sur <strong>+ Ajouter un champ</strong> dans la sidebar pour commencer.</span>
                                        </p>
                                        <button onClick={() => setMobileTab('questions')}
                                            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2563eb] px-4 py-2 rounded-xl hover:bg-[#1d4ed8] transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                                            Aller aux questions
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-semibold text-slate-500 mb-1">Aucune question sélectionnée</p>
                                        <p className="text-xs text-slate-400 mb-5">
                                            <span className="lg:hidden">Allez dans <strong>Questions</strong> et sélectionnez une question.</span>
                                            <span className="hidden lg:inline">Cliquez sur une question dans la liste à gauche pour l'éditer.</span>
                                        </p>
                                        <button onClick={() => setMobileTab('questions')}
                                            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                                            Voir les questions →
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── SIDEBAR DROITE : Propriétés ──────────────────────── */}
                <div className={`
                    lg:w-64 lg:flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden
                    ${mobileTab === 'properties' ? 'flex' : 'hidden lg:flex'}
                    h-full
                `}>
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Propriétés</span>
                            {sel && <p className="text-xs text-[#2563eb] mt-0.5 font-medium">{TYPE_LABEL[sel.type] ?? sel.type}</p>}
                        </div>
                        {/* Bouton retour vers éditeur sur mobile */}
                        {sel && (
                            <button onClick={() => setMobileTab('editor')}
                                className="lg:hidden text-xs font-medium text-slate-400 hover:text-[#2563eb] transition-colors flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                                Éditeur
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {sel && selIdx !== null ? (
                            <PropertiesPanel question={sel} onChange={(k, v) => setProp(selIdx, k, v)} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">Sélectionnez une question pour modifier ses propriétés</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MODAL APERÇU ─────────────────────────────────────────── */}
            {preview && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreview(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">{title}</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Aperçu — {questions.length} question{questions.length !== 1 ? 's' : ''}</p>
                            </div>
                            <button onClick={() => setPreview(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                            {questions.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-8">Aucun champ ajouté</p>
                            ) : questions.map((q, i) => (
                                <div key={i}>
                                    {q.type === 'block_title' ? (
                                        <div className="pb-3 border-b border-slate-100">
                                            <p className={`font-bold text-[#0f172a] ${q.properties.size==='h1' ? 'text-2xl' : q.properties.size==='h3' ? 'text-base' : 'text-xl'}`}>
                                                {q.properties.title || 'Titre'}
                                            </p>
                                            {q.properties.subtitle && <p className="text-sm text-slate-400 mt-1">{q.properties.subtitle}</p>}
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                                                {q.properties.label || 'Sans titre'}
                                                {q.properties.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <LivePreview question={q} interactive />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// ─── LivePreview ──────────────────────────────────────────────────────────────

function LivePreview({ question: q, interactive = false }: { question: Question; interactive?: boolean }) {
    const base = `w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 transition-all ${interactive ? 'focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 hover:border-slate-300' : 'cursor-not-allowed'}`;
    const dis = !interactive;
    switch (q.type) {
        case 'text_input':   return <input disabled={dis} placeholder={q.properties.placeholder} className={base} />;
        case 'textarea':     return <textarea disabled={dis} rows={parseInt(q.properties.rows ?? '4')} placeholder={q.properties.placeholder} className={`${base} resize-none`} />;
        case 'number_input': return <input disabled={dis} type="number" placeholder={q.properties.placeholder} className={base} />;
        case 'email':        return <input disabled={dis} type="email" placeholder={q.properties.placeholder} className={base} />;
        case 'phone':        return <input disabled={dis} type="tel" placeholder={q.properties.placeholder} className={base} />;
        case 'date_picker':  return <input disabled={dis} type="date" className={base} />;
        case 'dropdown':
            return (
                <select disabled={dis} defaultValue="" className={base}>
                    <option value="" disabled>{q.properties.placeholder || 'Choisissez…'}</option>
                    {(q.properties.options ?? '').split(',').filter(o => o.trim()).map((o, i) => (
                        <option key={i} value={o.trim()}>{o.trim()}</option>
                    ))}
                </select>
            );
        case 'checkbox':
            return (
                <label className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 ${interactive ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all' : 'cursor-not-allowed'}`}>
                    <input type="checkbox" disabled={dis} className="w-5 h-5 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]" />
                    <span className="text-sm text-slate-500">Case à cocher</span>
                </label>
            );
        case 'radio':
            return (
                <div className="space-y-2">
                    {(q.properties.options ?? 'Option 1').split(',').map((o, i) => (
                        <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 ${interactive ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all' : 'cursor-not-allowed'}`}>
                            <input type="radio" name={`radio-preview-${q.properties.label}`} disabled={dis} className="w-4 h-4 border-slate-300 text-[#2563eb] focus:ring-[#2563eb]" />
                            <span className="text-sm text-slate-500">{o.trim()}</span>
                        </label>
                    ))}
                </div>
            );
        case 'file_upload':
            return (
                <label className={`border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-8 text-center flex flex-col items-center ${interactive ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all' : 'cursor-not-allowed'}`}>
                    <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    <p className="text-xs text-slate-400">Glisser un fichier ou <span className="text-[#2563eb] font-semibold">cliquer</span></p>
                    {interactive && <input type="file" className="sr-only" accept={q.properties.accept || undefined} />}
                </label>
            );
        default: return null;
    }
}

// ─── PropertiesPanel ──────────────────────────────────────────────────────────

function PropertiesPanel({ question: q, onChange }: { question: Question; onChange: (k: string, v: unknown) => void }) {
    const inp = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#0f172a] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all";
    const lbl = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

    if (q.type === 'block_title') return (
        <div className="space-y-4">
            <div><label className={lbl}>Titre</label><input value={q.properties.title ?? ''} onChange={e => onChange('title', e.target.value)} className={inp} placeholder="Titre…"/></div>
            <div><label className={lbl}>Sous-titre</label><input value={q.properties.subtitle ?? ''} onChange={e => onChange('subtitle', e.target.value)} className={inp} placeholder="Optionnel…"/></div>
            <div>
                <label className={lbl}>Taille</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['h1','h2','h3'] as FieldSize[]).map(s => (
                        <button key={s} onClick={() => onChange('size', s)}
                            className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${(q.properties.size ?? 'h2') === s ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div><label className={lbl}>Libellé</label><input value={q.properties.label ?? ''} onChange={e => onChange('label', e.target.value)} className={inp} placeholder="Question…"/></div>

            {['text_input','textarea','number_input','email','phone','dropdown'].includes(q.type) && (
                <div><label className={lbl}>Placeholder</label><input value={q.properties.placeholder ?? ''} onChange={e => onChange('placeholder', e.target.value)} className={inp} placeholder="Texte indicatif…"/></div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-medium text-slate-600">Obligatoire</span>
                <button onClick={() => onChange('required', !q.properties.required)}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${q.properties.required ? 'bg-[#2563eb]' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${q.properties.required ? 'left-5' : 'left-0.5'}`}></span>
                </button>
            </div>

            {q.type === 'textarea' && (
                <div><label className={lbl}>Nombre de lignes</label><input type="number" min={2} max={10} value={q.properties.rows ?? '4'} onChange={e => onChange('rows', e.target.value)} className={inp}/></div>
            )}
            {q.type === 'text_input' && (
                <div><label className={lbl}>Longueur max</label><input type="number" min={1} value={q.properties.maxLength ?? ''} onChange={e => onChange('maxLength', e.target.value)} className={inp} placeholder="255"/></div>
            )}
            {q.type === 'number_input' && (
                <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Min</label><input type="number" value={q.properties.min ?? ''} onChange={e => onChange('min', e.target.value)} className={inp} placeholder="0"/></div>
                    <div><label className={lbl}>Max</label><input type="number" value={q.properties.max ?? ''} onChange={e => onChange('max', e.target.value)} className={inp} placeholder="100"/></div>
                </div>
            )}
            {['dropdown','radio'].includes(q.type) && (
                <div>
                    <label className={lbl}>Options <span className="normal-case font-normal text-slate-300">(séparées par virgule)</span></label>
                    <textarea rows={4} value={q.properties.options ?? ''} onChange={e => onChange('options', e.target.value)} className={`${inp} resize-none`} placeholder="Option 1, Option 2"/>
                </div>
            )}
            {q.type === 'file_upload' && (
                <div><label className={lbl}>Types acceptés</label><input value={q.properties.accept ?? ''} onChange={e => onChange('accept', e.target.value)} className={inp} placeholder=".pdf, image/*"/></div>
            )}
        </div>
    );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spin({ white = false }: { white?: boolean }) {
    return (
        <svg className={`w-3.5 h-3.5 animate-spin ${white ? 'text-white' : 'text-current'}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
    );
}