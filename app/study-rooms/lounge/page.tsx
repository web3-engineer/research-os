"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpenIcon, UsersIcon, BeakerIcon,
    XMarkIcon, NewspaperIcon, GlobeAmericasIcon,
    LockClosedIcon, CpuChipIcon, ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";

import { Navbar } from "@/components/main/navbar";
import FeedBrasil from "./lounge-br/FeedBrasil";

// 1. IMPORTANDO O CHAT WIDGET
import { LoungeChatWidget } from "@/components/sub/LoungeChatWidget";

// --- APPLE STYLE LOADING ICON ---
const LoadingIcon = () => (
    <div className="flex flex-col items-center justify-center p-20 w-full h-full">
        <div className="relative w-8 h-8 animate-spin">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-[2px] h-[7px] bg-slate-500 dark:bg-white/40 rounded-full left-1/2 top-0 origin-[0_15px]"
                    style={{ transform: `rotate(${i * 45}deg)`, opacity: 1 - (i * 0.1) }}
                />
            ))}
        </div>
    </div>
);

// --- DYNAMIC IMPORTS ---
const LoungeEarth = dynamic(() => import("@/components/sub/LoungeEarth"), {
    ssr: false,
    loading: () => <div className="w-40 h-40 rounded-full border border-white/5 animate-pulse" />
}) as any;

// Módulos Privados
const ProjetosModule = dynamic(() => import("./lounge-br/projetos/page"), { loading: LoadingIcon });
const ProvasModule = dynamic(() => import("./lounge-br/provas/page"), { loading: LoadingIcon });
const AulasModule = dynamic(() => import("./lounge-br/aulas/page"), { loading: LoadingIcon });

// Módulos Públicos
const PesquisaModule = dynamic(() => import("./lounge-br/pesquisas/page"), { loading: LoadingIcon });
const NoticiasModule = dynamic(() => import("./lounge-br/noticias/page"), { loading: LoadingIcon });

export default function LoungePage() {
    // Simulação de Login
    const isLoggedIn = false; 

    const [activeTab, setActiveTab] = useState("community");
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [isFeedActive, setIsFeedActive] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    const cardStyle = `
        dark:bg-white/[0.05] bg-white/60
        backdrop-blur-[45px] saturate-[1.3]
        border dark:border-white/10 border-white/80
        shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]
    `;

    // --- LÓGICA DE RENDERIZAÇÃO ---
    const renderMainContent = () => {
        switch (activeTab) {
            // --- PÚBLICOS ---
            case "community":
                return (
                    <div className="w-full flex flex-col items-center">
                        <motion.div
                            animate={{ scale: isFeedActive ? 0.8 : 1, opacity: isFeedActive ? 0.6 : 1 }}
                            className="w-[380px] h-[380px] shrink-0 relative z-10 my-4"
                        >
                            <LoungeEarth onSelectRegion={(region: string) => setSelectedRegion(region)} />
                        </motion.div>
                        
                        <AnimatePresence mode="wait">
                            {selectedRegion === 'br' && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
                                    {!isFeedActive ? (
                                        <div className={`p-8 rounded-[2.5rem] ${cardStyle} text-center`}>
                                            <GlobeAmericasIcon className="w-8 h-8 mx-auto text-[#0f172a] dark:text-blue-400 mb-4" />
                                            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Cluster Brasil</h3>
                                            <button 
                                                onClick={() => setIsFeedActive(true)} 
                                                className="mt-6 px-8 py-3 bg-[#0f172a] text-white dark:bg-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                            >
                                                Conectar à Rede
                                            </button>
                                        </div>
                                    ) : <FeedBrasil />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case "research":
                return <PesquisaModule />;
            case "news":
                return <NoticiasModule />;

            // --- PRIVADOS ---
            case "projects":
            case "exams":
            case "lessons":
                if (!isLoggedIn) {
                    let moduleName = '';
                    if (activeTab === 'projects') moduleName = 'Projetos';
                    if (activeTab === 'exams') moduleName = 'Provas & Certificações';
                    if (activeTab === 'lessons') moduleName = 'Aulas';

                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="flex flex-col items-center justify-center p-12 text-center h-full"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#0f172a]/10 dark:bg-white/5 flex items-center justify-center mb-6">
                                <LockClosedIcon className="w-8 h-8 text-[#0f172a] dark:text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-2">Acesso Restrito</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                                Identidade não verificada. Por favor, realize o login para acessar o módulo de <span className="font-bold text-[#0f172a] dark:text-slate-200 capitalize">{moduleName}</span>.
                            </p>
                            <button className="mt-8 px-8 py-2.5 bg-[#0f172a] dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:opacity-90 transition-all">
                                Autenticar Agora
                            </button>
                        </motion.div>
                    );
                }
                
                if (activeTab === 'projects') return <ProjetosModule />;
                if (activeTab === 'exams') return <ProvasModule />;
                if (activeTab === 'lessons') return <AulasModule />;
                return null;

            default:
                return null;
        }
    };

    return (
        <div className="relative z-0 w-screen h-screen dark:bg-[#010816] bg-[#e2e8f0] transition-colors duration-1000 font-sans overflow-hidden flex flex-col">
            <Navbar />
            
            {/* CONTAINER PRINCIPAL: Ajustado para justify-start e px-4 (Sidebar vai para a esquerda) */}
            <div className="flex items-start justify-start px-4 gap-6 pt-32 w-full h-full relative">
                
                {/* SIDEBAR */}
                <motion.aside
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                    onMouseLeave={() => setIsSidebarExpanded(false)}
                    className={`z-10 h-[70vh] rounded-[2.5rem] ${cardStyle} transition-all duration-500 flex flex-col items-center py-6 gap-4 ${isSidebarExpanded ? 'w-64 px-6' : 'w-20'}`}
                >
                    <div className="flex flex-col gap-2 w-full flex-1 justify-center">
                        <SidebarItem icon={<BeakerIcon className="w-5 h-5" />} label="Projetos" active={activeTab === 'projects'} expanded={isSidebarExpanded} onClick={() => setActiveTab('projects')} />
                        <SidebarItem icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />} label="Provas" active={activeTab === 'exams'} expanded={isSidebarExpanded} onClick={() => setActiveTab('exams')} />
                        <SidebarItem icon={<BookOpenIcon className="w-5 h-5" />} label="Aulas" active={activeTab === 'lessons'} expanded={isSidebarExpanded} onClick={() => setActiveTab('lessons')} />
                        <SidebarItem icon={<UsersIcon className="w-5 h-5" />} label="Comunidade" active={activeTab === 'community'} expanded={isSidebarExpanded} onClick={() => setActiveTab('community')} />
                        <SidebarItem icon={<CpuChipIcon className="w-5 h-5" />} label="Pesquisas" active={activeTab === 'research'} expanded={isSidebarExpanded} onClick={() => setActiveTab('research')} />
                        <SidebarItem icon={<NewspaperIcon className="w-5 h-5" />} label="Notícias" active={activeTab === 'news'} expanded={isSidebarExpanded} onClick={() => setActiveTab('news')} />
                    </div>
                </motion.aside>

                {/* ÁREA CENTRAL: Removido 'max-w-5xl' e adicionado 'flex-1' para expandir o campo de visão */}
                <main className={`z-10 flex-1 h-[82vh] rounded-[3.5rem] ${cardStyle} overflow-hidden flex flex-col relative`}>
                    <div className="p-10 pb-4 flex justify-between items-center border-b dark:border-white/5 border-black/5">
                        <h2 className="text-xl font-black uppercase tracking-[0.3em] dark:text-white text-[#0f172a] leading-none">
                            {activeTab === 'exams' ? 'Provas' : activeTab}
                        </h2>
                        {selectedRegion && activeTab === 'community' && (
                            <button onClick={() => setSelectedRegion(null)} className="flex items-center gap-2 px-4 py-1.5 dark:bg-white/10 bg-[#0f172a] rounded-full text-[9px] font-black text-white uppercase tracking-widest hover:scale-105 transition-all">
                                <XMarkIcon className="w-4 h-4" /> Reset Orbit
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12 pt-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {renderMainContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* CHAT WIDGET */}
                <LoungeChatWidget />
                
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, active, expanded, onClick }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-5 w-full p-4 rounded-2xl transition-all 
            ${active
            ? 'dark:bg-white/10 bg-[#0f172a] text-white shadow-lg border dark:border-white/10 border-transparent'
            : 'dark:text-white/40 text-slate-500 hover:dark:text-white hover:text-[#0f172a]'}`}>
            <div className="shrink-0">{icon}</div>
            {expanded && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black uppercase tracking-widest truncate">{label}</motion.span>}
        </button>
    );
}