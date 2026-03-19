import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

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
            <Head title="Connexion — STATS ENQUETES" />

            <div className="min-h-screen bg-white flex">

                {/* ─── COLONNE GAUCHE : déco ─── */}
                <div className="hidden lg:flex w-[52%] bg-[#2563eb] relative overflow-hidden flex-col justify-between p-16">

                    {/* Cercles décoratifs */}
                    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5"></div>
                    <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/5"></div>

                    {/* Logo */}
                    <Link href="/" className="relative z-10 flex items-center gap-2 w-fit">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <span className="font-bold text-white text-base tracking-tight">STATS ENQUETES</span>
                    </Link>

                    {/* Texte central */}
                    <div className="relative z-10">
                     
                        <h2 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                            Collectez.<br />
                            Analysez.<br />
                            Décidez.
                        </h2>
                        <p className="text-white/70 text-lg leading-relaxed max-w-sm">
                            Des enquêtes intelligentes pour des décisions éclairées. Rejoignez 15 000+ organisations.
                        </p>

                        {/* Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-6">
                            {[
                                { n: '120K+', l: 'Enquêtes' },
                                { n: '8M+', l: 'Réponses' },
                                { n: '98%', l: 'Satisfaction' },
                            ].map(s => (
                                <div key={s.n} className="border-l-2 border-white/20 pl-4">
                                    <div className="text-2xl font-extrabold text-white">{s.n}</div>
                                    <div className="text-xs text-white/60 mt-0.5 uppercase tracking-wide">{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer gauche */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-white/50 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            Données chiffrées · RGPD conforme
                        </div>
                    </div>
                </div>

                {/* ─── COLONNE DROITE : formulaire ─── */}
                <div className="flex-1 flex flex-col justify-between px-8 py-10 lg:px-14">

                    {/* Logo mobile */}
                    <Link href="/" className="flex items-center gap-2 w-fit lg:hidden">
                        <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <span className="font-bold text-[#0f172a] text-base tracking-tight">STATS ENQUETES</span>
                    </Link>

                    {/* Formulaire centré */}
                    <div className="w-full max-w-sm mx-auto">

                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#0f172a] mb-2">
                                Connexion
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Entrez vos identifiants pour continuer
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        {/* Bannière démo */}
                        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold text-[#2563eb] uppercase tracking-widest mb-1">Accès démo</p>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-slate-500">Email : <code className="font-mono font-semibold text-[#0f172a]">demo@stat-enquete.com</code></span>
                                        <span className="text-xs text-slate-500">Mdp : <code className="font-mono font-semibold text-[#0f172a]">password</code></span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={fillDemo}
                                    className="flex-shrink-0 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] px-3 py-2 rounded-lg transition-colors"
                                >
                                    Remplir
                                </button>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="votre@email.com"
                                    autoFocus
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 text-[#0f172a] text-sm placeholder-slate-300 focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Mot de passe
                                    </label>
                                    <a href="#" className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
                                        Oublié ?
                                    </a>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 text-[#0f172a] text-sm placeholder-slate-300 focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember */}
                            <label className="flex items-center gap-3 cursor-pointer select-none group">
                                <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${data.remember ? 'bg-[#2563eb] border-[#2563eb]' : 'border-slate-300 bg-white group-hover:border-blue-300'}`}
                                    onClick={() => setData('remember', !data.remember)}
                                >
                                    {data.remember && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                        </svg>
                                    )}
                                </div>
                                <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="sr-only" />
                                <span className="text-sm text-slate-500">Se souvenir de moi</span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#2563eb] text-white font-semibold py-4 rounded-xl text-sm hover:bg-[#1d4ed8] transition-all hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Connexion…
                                    </span>
                                ) : 'Se connecter →'}
                            </button>
                        </form>

                        <p className="text-sm text-slate-400 text-center mt-6">
                            Pas encore de compte ?{' '}
                            <a href="#" className="font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
                                Créer un compte
                            </a>
                        </p>
                    </div>

                    {/* Retour */}
                    <Link href="/" className="text-xs text-slate-400 hover:text-[#2563eb] transition-colors flex items-center gap-1.5 w-fit mx-auto">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </>
    );
}