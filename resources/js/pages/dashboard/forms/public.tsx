import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface QProps { label?: string; placeholder?: string; required?: boolean; rows?: string; min?: string; max?: string; options?: string; accept?: string; title?: string; subtitle?: string; size?: string; [key: string]: unknown; }
interface Question { id: number; type: string; properties: QProps; order: number; }
interface FormInfo { id: number; title: string; description: string | null; color: string; reference: string; confirmation_message: string | null; }
interface Props { form: FormInfo; questions: Question[]; }

export default function PublicForm({ form, questions }: Props) {
    const [answers,    setAnswers]    = useState<Record<number, string>>({});
    const [errors,     setErrors]     = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const setAnswer = (id: number, val: string) => {
        setAnswers(prev => ({ ...prev, [id]: val }));
        if (errors[id]) setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
    };

    const validate = (): boolean => {
        const newErrors: Record<number, string> = {};
        questions.forEach(q => {
            if (q.properties.required && q.type !== 'block_title') {
                if (!(answers[q.id] ?? '').trim()) newErrors[q.id] = (q.properties.label ?? 'Ce champ') + ' est obligatoire.';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        router.post(`/f/${form.reference}`, { answers }, {
            onError: (errs) => {
                setSubmitting(false);
                const mapped: Record<number, string> = {};
                Object.entries(errs).forEach(([key, msg]) => { const match = key.match(/answers\.(\d+)/); if (match) mapped[parseInt(match[1])] = msg as string; });
                setErrors(mapped);
            },
        });
    };

    return (
        <>
            <Head title={form.title} />
            <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4 sm:mb-5 shadow-sm">
                        <div className="h-2" style={{ backgroundColor: form.color }}></div>
                        <div className="px-5 sm:px-8 py-5 sm:py-7">
                            <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] mb-2">{form.title}</h1>
                            {form.description && <p className="text-sm text-slate-500 leading-relaxed">{form.description}</p>}
                        </div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {questions.map((q, i) => (
                            <QuestionField key={q.id} question={q} index={i} value={answers[q.id] ?? ''} error={errors[q.id]} onChange={val => setAnswer(q.id, val)} color={form.color} />
                        ))}
                        <div className="pt-2">
                            <button type="submit" disabled={submitting} className="w-full py-3 sm:py-3.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 hover:opacity-90 shadow-sm" style={{ backgroundColor: form.color }}>
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        Envoi en cours…
                                    </span>
                                ) : 'Envoyer mes réponses'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">Propulsé par <span className="font-semibold text-slate-500">STATS ENQUETES</span></p>
                </div>
            </div>
        </>
    );
}

function QuestionField({ question: q, index, value, error, onChange, color }: { question: Question; index: number; value: string; error?: string; onChange: (val: string) => void; color: string; }) {
    const base = `w-full px-4 py-3 rounded-xl border text-sm text-[#0f172a] transition-all outline-none focus:ring-2 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:ring-blue-50'}`;

    if (q.type === 'block_title') {
        const sz = q.properties.size === 'h1' ? 'text-2xl' : q.properties.size === 'h3' ? 'text-base' : 'text-xl';
        return (
            <div className="bg-white rounded-2xl border border-slate-100 px-5 sm:px-8 py-5 sm:py-6 shadow-sm">
                <p className={`${sz} font-bold text-[#0f172a]`}>{q.properties.title || 'Section'}</p>
                {q.properties.subtitle && <p className="text-sm text-slate-400 mt-1">{q.properties.subtitle}</p>}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 px-5 sm:px-8 py-5 sm:py-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#0f172a] mb-3">
                {q.properties.label || 'Question'}
                {q.properties.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {q.type === 'text_input'    && <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={q.properties.placeholder} className={base} />}
            {q.type === 'textarea'      && <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={q.properties.placeholder} rows={parseInt(q.properties.rows ?? '4')} className={`${base} resize-none`} />}
            {q.type === 'number_input'  && <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={q.properties.placeholder} min={q.properties.min || undefined} max={q.properties.max || undefined} className={base} />}
            {q.type === 'email'         && <input type="email" value={value} onChange={e => onChange(e.target.value)} placeholder={q.properties.placeholder} className={base} />}
            {q.type === 'phone'         && <input type="tel" value={value} onChange={e => onChange(e.target.value)} placeholder={q.properties.placeholder} className={base} />}
            {q.type === 'date_picker'   && <input type="date" value={value} onChange={e => onChange(e.target.value)} className={base} />}

            {q.type === 'dropdown' && (
                <select value={value} onChange={e => onChange(e.target.value)} className={base}>
                    <option value="">{q.properties.placeholder || 'Choisissez une option…'}</option>
                    {(q.properties.options ?? '').split(',').filter(o => o.trim()).map((o, i) => <option key={i} value={o.trim()}>{o.trim()}</option>)}
                </select>
            )}

            {q.type === 'radio' && (
                <div className="space-y-2">
                    {(q.properties.options ?? '').split(',').filter(o => o.trim()).map((o, i) => (
                        <label key={i} className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border cursor-pointer transition-all ${value === o.trim() ? 'border-2 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`} style={value === o.trim() ? { borderColor: color, backgroundColor: color + '10' } : {}}>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${value === o.trim() ? 'border-current' : 'border-slate-300'}`} style={value === o.trim() ? { borderColor: color } : {}}>
                                {value === o.trim() && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>}
                            </div>
                            <input type="radio" name={`q-${q.id}`} value={o.trim()} checked={value === o.trim()} onChange={e => onChange(e.target.value)} className="sr-only" />
                            <span className="text-sm text-[#0f172a]">{o.trim()}</span>
                        </label>
                    ))}
                </div>
            )}

            {q.type === 'checkbox' && (
                <label className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border cursor-pointer transition-all ${value === 'true' ? 'border-2 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`} style={value === 'true' ? { borderColor: color, backgroundColor: color + '10' } : {}}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${value === 'true' ? 'border-current' : 'border-slate-300'}`} style={value === 'true' ? { borderColor: color, backgroundColor: color } : {}}>
                        {value === 'true' && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <input type="checkbox" checked={value === 'true'} onChange={e => onChange(e.target.checked ? 'true' : '')} className="sr-only" />
                    <span className="text-sm text-[#0f172a]">{q.properties.label || 'Case à cocher'}</span>
                </label>
            )}

            {q.type === 'file_upload' && (
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col items-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all">
                    <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    <p className="text-xs text-slate-400">Glisser un fichier ou <span className="font-semibold" style={{ color }}>cliquer</span></p>
                    {value && <p className="text-xs font-medium text-green-600 mt-2">✓ {value}</p>}
                    <input type="file" className="sr-only" accept={q.properties.accept || undefined} onChange={e => onChange(e.target.files?.[0]?.name ?? '')} />
                </label>
            )}

            {error && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {error}
                </p>
            )}
        </div>
    );
}