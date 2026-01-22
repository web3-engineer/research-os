"use client";

import { ClipboardDocumentCheckIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function ProvasModule() {
    return (
        <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0f172a] to-blue-900 dark:from-white/5 dark:to-white/10 border border-white/10 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Próxima Avaliação</h3>
                    <p className="text-sm text-white/70 mb-6 max-w-sm">
                        Certificação Zaeon: Nível 3 - Bioengenharia e Sistemas Autônomos.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold">
                            <ClockIcon className="w-4 h-4" /> 24h : 00m
                        </div>
                        <button className="px-6 py-2 bg-white text-[#0f172a] rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                            Iniciar Pré-teste
                        </button>
                    </div>
                </div>
                <ClipboardDocumentCheckIcon className="absolute -bottom-4 -right-4 w-40 h-40 text-white/5 rotate-[-15deg]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/40 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-[#0f172a]/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#0f172a]/10 dark:bg-white/10 flex items-center justify-center text-[#0f172a] dark:text-white">
                                <span className="font-bold text-xs">{i === 1 ? 'A' : 'B'}+</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase text-slate-400">Concluído</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0f172a] dark:text-white mb-1">
                            {i === 1 ? 'Algoritmos Genéticos I' : 'Ética em IA'}
                        </h4>
                        <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-3">
                            <div className="w-full h-full bg-green-500/80" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}