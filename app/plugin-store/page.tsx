"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    MagnifyingGlassIcon, 
    PuzzlePieceIcon, 
    RocketLaunchIcon,
    AcademicCapIcon, 
    CubeTransparentIcon, 
    PlayIcon,
    ArrowLeftIcon, 
    LockClosedIcon
} from "@heroicons/react/24/outline";

// --- INTERFACE ---
interface Plugin {
    id: string;
    name: string;
    author: string;
    description: string;
    category: "Essencial" | "Agentes" | "Mentorias" | "Blockchain";
    tag?: string; 
    price: number;
    actionUrl: string;
    isLocked: boolean;
    unlockRequirement?: string;
}

export default function PluginStorePage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const categories = ["All", "Essencial", "Agentes", "Mentorias", "Blockchain"];

    useEffect(() => {
        setMounted(true);
        fetchPlugins();
    }, []);

    const fetchPlugins = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/plugins');
            if (res.ok) {
                const data = await res.json();
                setPlugins(data);
            }
        } catch (error) {
            console.error("Zaeon Store Sync Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    const filteredPlugins = plugins.filter(p => 
        (category === "All" || p.category === category) &&
        (p.name.toLowerCase().includes(search.toLowerCase()))
    );

    // --- CLASSES DE ESTILO UNIFICADAS ---
    const headerContainer = "pointer-events-auto w-full max-w-7xl h-16 rounded-full backdrop-blur-2xl transition-all duration-500 " + 
                            "bg-white/90 border border-slate-300 shadow-xl " + 
                            "dark:bg-black/40 dark:border-white/10 dark:shadow-2xl";

    const cardStyle = "group relative p-6 rounded-[32px] backdrop-blur-2xl transition-all duration-500 flex flex-col h-full overflow-hidden border " + 
                     "bg-white/80 border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.08)] " + 
                     "dark:bg-cyan-950/10 dark:border-white/10 dark:shadow-2xl " +
                     "hover:border-cyan-500/50 dark:hover:border-cyan-400/40";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030014] text-slate-950 dark:text-white transition-colors duration-500 font-sans">
            
            {/* --- CABEÇALHO LOCAL --- */}
            <div className="sticky top-0 z-[100] w-full pt-6 pb-4 px-6 flex justify-center pointer-events-none">
                <div className={headerContainer}>
                    <div className="flex items-center justify-between h-full px-6">
                        
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push('/')} 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cyan-600 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            
                            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-cyan-900/80">
                                Zaeon <span className="text-cyan-600 dark:text-cyan-500">Modules</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mr-2">Secure Link</span>
                            <div className="w-10 h-10 rounded-full border border-slate-300 dark:border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-cyan-400 bg-white dark:bg-transparent shadow-sm">
                                LV.1
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                
                {/* TÍTULO E BUSCA */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">Plugin Store</h1>
                        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-400 pl-1">Upgrade your workstation equipment</p>
                    </div>
                    
                    <div className="relative w-full max-w-md">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search modules..." 
                            className="w-full pl-14 pr-6 py-4 rounded-[22px] bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 outline-none focus:ring-2 ring-cyan-500 transition-all text-sm shadow-inner dark:shadow-none"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* CATEGORIAS */}
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                            ${category === cat 
                                ? "bg-slate-950 dark:bg-cyan-500 text-white dark:text-black shadow-xl scale-105" 
                                : "bg-white/90 dark:bg-white/5 text-slate-400 dark:text-white/40 border border-slate-300 dark:border-transparent hover:text-slate-900 dark:hover:text-white shadow-sm"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* GRID DE PLUGINS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {isLoading ? (
                        <div className="col-span-full py-32 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Connecting to Grid...</p>
                        </div>
                    ) : (
                        filteredPlugins.map(plugin => (
                            <PluginCard key={plugin.id} plugin={plugin} cardStyle={cardStyle} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

function PluginCard({ plugin, cardStyle }: { plugin: Plugin, cardStyle: string }) {
    const getIcon = () => {
        switch(plugin.category) {
            case "Agentes": return <RocketLaunchIcon className="w-6 h-6" />;
            case "Mentorias": return <AcademicCapIcon className="w-6 h-6" />;
            case "Blockchain": return <CubeTransparentIcon className="w-6 h-6" />;
            default: return <PuzzlePieceIcon className="w-6 h-6" />;
        }
    };

    return (
        <motion.div 
            layout
            whileHover={plugin.isLocked ? {} : { y: -10 }}
            className={`${cardStyle} ${plugin.isLocked ? "grayscale opacity-70" : ""}`}
        >
            {/* OVERLAY BLOQUEADO */}
            {plugin.isLocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100/10 dark:bg-black/60 backdrop-blur-[5px]">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-2xl mb-4 border border-slate-200 dark:border-white/20">
                        <LockClosedIcon className="w-8 h-8 text-slate-900 dark:text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white text-center px-8 leading-relaxed drop-shadow-md">
                        {plugin.unlockRequirement || "Access Denied"}
                    </span>
                </div>
            )}

            <div className="flex justify-between items-start mb-8">
                <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 shadow-inner">
                    {getIcon()}
                </div>
                {plugin.tag && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/50 shadow-sm">
                        {plugin.tag}
                    </span>
                )}
            </div>

            <div className="space-y-3 flex-1">
                <h3 className="text-2xl font-black tracking-tighter text-slate-950 dark:text-white leading-tight">{plugin.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-cyan-800 uppercase tracking-widest">Dev: {plugin.author}</p>
                <p className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 line-clamp-3 ${plugin.isLocked ? "blur-sm" : ""}`}>
                    {plugin.description}
                </p>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Investment</span>
                    <span className="text-lg font-black text-slate-950 dark:text-white">
                        {plugin.price === 0 ? "FREE" : `$${plugin.price}`}
                    </span>
                </div>
                
                <button 
                    disabled={plugin.isLocked}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
                    ${plugin.isLocked 
                        ? "bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-white/10" 
                        : "bg-slate-950 dark:bg-cyan-500 text-white dark:text-black hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/20"
                    }`}
                >
                    {plugin.isLocked ? "Locked" : "Activate"}
                </button>
            </div>
        </motion.div>
    );
}