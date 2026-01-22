"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CpuChipIcon, BeakerIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// --- DADOS MOCKUP (Gerador para 35 pesquisas) ---
const TITLES = [
    "Bio-sintetização de Grafeno via Bactérias E.Coli",
    "Redes Neurais em Micélio: Processamento de Dados Orgânicos",
    "Enzima Z-77: Degradação Acelerada de Polímeros PET",
    "Concreto Auto-regenerativo com Esporos Bacterianos",
    "Fotossíntese Artificial para Captura de Carbono Industrial",
    "Interface Neuro-Botânica: Comunicação Planta-Máquina",
    "Bio-mineração de Terras Raras em Resíduos Eletrônicos",
    "Pele Sintética Sensorial para Próteses Avançadas",
    "Algoritmos Genéticos para Otimização de Proteínas",
    "Armazenamento de Dados em DNA Sintético (Project Glass)",
    "Bioluminescência Urbana: Substituição de Iluminação Pública",
    "Filtragem de Microplásticos via Membranas de Quitina",
];

const ROLES = ["Graduandos", "Mestres", "PhDs"];

// Gerar 35 itens
const RESEARCH_DATA = Array.from({ length: 35 }).map((_, i) => {
    // Forçar 3 itens com progresso perto de 90%
    let progress = Math.floor(Math.random() * 60) + 20; 
    if (i === 3) progress = 92;
    if (i === 12) progress = 89;
    if (i === 28) progress = 95;

    return {
        id: i + 1,
        title: TITLES[i % TITLES.length] + (i > 11 ? ` [Fase ${Math.floor(i/5)}]` : ""),
        participants: {
            grads: Math.floor(Math.random() * 8) + 2,
            masters: Math.floor(Math.random() * 4) + 1,
            phds: Math.floor(Math.random() * 3) + 1,
        },
        progress: progress,
        status: progress > 90 ? "Validando" : "Em Progresso"
    };
});

const AGENT_LOGS = [
    "AGENT-01: Relatório de enzimas submetido à Blockchain [Hash: 0x7f...]",
    "AGENT-04: Solicitou revisão por pares para o Projeto #12",
    "AGENT-09: Identificou anomalia positiva na amostra B-99",
    "SYSTEM: Novo doutorando adicionado ao cluster de Bio-Materiais",
    "AGENT-02: Otimização de recursos computacionais concluída",
    "AGENT-07: Iniciando simulação de dobra de proteínas...",
];

export default function PesquisasPage() {
    const [logs, setLogs] = useState(AGENT_LOGS);

    // Efeito de "Terminal Vivo" rotacionando logs
    useEffect(() => {
        const interval = setInterval(() => {
            setLogs(current => {
                const [first, ...rest] = current;
                return [...rest, first];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-6">
            
            {/* --- TOP: AGENT HUB (ON-CHAIN FEED) --- */}
            <div className="w-full p-6 rounded-3xl bg-[#0f172a] border border-white/10 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <CpuChipIcon className="w-24 h-24 text-white" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Zaeon On-Chain Oracle</h3>
                    </div>
                    
                    <div className="h-20 overflow-hidden relative mask-image-gradient">
                        <div className="space-y-3">
                            {logs.slice(0, 3).map((log, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-mono text-[10px] text-green-400/80 flex items-center gap-2"
                                >
                                    <span className="text-white/30">{new Date().toLocaleTimeString()} &gt;</span>
                                    {log}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- LISTA DE PESQUISAS --- */}
            <div className="flex items-center justify-between px-2">
                <h2 className="text-[#0f172a] dark:text-white text-sm font-bold uppercase tracking-widest">
                    35 Projetos Ativos
                </h2>
                <div className="flex gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                     <span className="text-[10px] dark:text-slate-400">Dados em tempo real</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pb-20">
                {RESEARCH_DATA.map((item) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-5 rounded-2xl bg-white/40 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:border-[#0f172a]/30 dark:hover:border-white/20 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#0f172a]/5 dark:bg-white/10 text-[#0f172a] dark:text-white">
                                    <BeakerIcon className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-bold text-[#0f172a] dark:text-slate-200 uppercase max-w-md leading-tight">
                                    {item.title}
                                </h4>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${item.progress > 90 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                                {item.status}
                            </span>
                        </div>

                        {/* PARTICIPANTES */}
                        <div className="flex gap-4 mb-4 pl-11">
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">
                                <b className="text-[#0f172a] dark:text-white">{item.participants.phds}</b> PhDs
                            </div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">
                                <b className="text-[#0f172a] dark:text-white">{item.participants.masters}</b> Mestres
                            </div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">
                                <b className="text-[#0f172a] dark:text-white">{item.participants.grads}</b> Graduandos
                            </div>
                        </div>

                        {/* PROGRESS BAR */}
                        <div className="pl-11">
                            <div className="flex justify-between text-[9px] font-bold mb-1 text-[#0f172a] dark:text-white">
                                <span>Progresso da Validação</span>
                                <span>{item.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${item.progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={`h-full rounded-full ${item.progress > 90 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-[#0f172a] to-blue-600 dark:from-blue-600 dark:to-purple-500'}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}