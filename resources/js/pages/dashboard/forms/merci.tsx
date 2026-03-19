import { Head, Link } from '@inertiajs/react';

interface Props {
    form: {
        title: string;
        confirmation_message: string;
        color: string;
    };
}

export default function Merci({ form }: Props) {
    return (
        <>
            <Head title={`Merci — ${form.title}`} />

            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    {/* Icône succès */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                        style={{ backgroundColor: form.color }}>
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h1 className="text-2xl font-bold text-[#0f172a] mb-3">Réponse enregistrée !</h1>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            {form.confirmation_message || 'Merci pour votre participation. Vos réponses ont bien été enregistrées.'}
                        </p>
                        <div className="h-px bg-slate-100 mb-6"></div>
                        <p className="text-xs text-slate-400">
                            Propulsé par <span className="font-semibold text-slate-500">STATS ENQUETES</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}