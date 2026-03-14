"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
    ChevronRightIcon,
    WifiIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";

const ROOMS = [
    { id: 1, nameKey: "global_name", topicKey: "global_topic", route: "/study-rooms/lounge" },
    { id: 2, nameKey: "cyber_name", topicKey: "cyber_topic", route: "/study-rooms/cyber" },
    { id: 3, nameKey: "bio_name", topicKey: "bio_topic", route: "/study-rooms/bio" },
    { id: 4, nameKey: "quantum_name", topicKey: "quantum_topic", route: "/study-rooms/quantic" },
    { id: 5, nameKey: "humanities_name", topicKey: "humanities_topic", route: "/study-rooms/humanities" },
];

export default function StudyRoomsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleJoinRoom = () => {
        if (!selectedRoom) return;
        const room = ROOMS.find((r) => r.id === selectedRoom);
        if (room?.route) router.push(room.route);
    };

    // --- CLONANDO A ESTÉTICA DO MENU NAVIGATION ---
    const panelStyle = "w-full max-w-[400px] rounded-[32px] overflow-hidden backdrop-blur-2xl transition-all duration-500 bg-cyan-950/10 border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col relative";

    const cardBaseStyle = "group relative overflow-hidden flex items-center justify-between rounded-2xl px-5 min-h-[52px] w-full transition-all duration-300 cursor-pointer font-medium text-slate-950 dark:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/30";

    const cardSelectedStyle = "bg-cyan-400/10 border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]";

    const accentBar = (active: boolean) => `absolute left-1 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full transition-all duration-500 ${active ? "bg-cyan-400 opacity-100 scale-y-100" : "bg-transparent opacity-0 scale-y-0"}`;

    if (!mounted) return <div className="w-full h-screen bg-[#eef2f6] dark:bg-[#030014]"><MatrixRain /></div>;

    return (
        <div className="w-full h-screen bg-[#eef2f6] dark:bg-[#030014] overflow-hidden relative flex items-center justify-center transition-colors duration-500">
            <MatrixRain />

            {/* --- GRID DE CONTEÚDO --- */}
            <div className="z-20 w-full max-w-[1700px] h-full grid grid-cols-1 lg:grid-cols-12 gap-0 relative">

                {/* PERSONAGEM (ESQUERDA) */}
                <div className="absolute bottom-0 left-0 w-full h-full lg:static lg:col-span-7 flex items-end justify-center lg:justify-start pointer-events-none z-10">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="relative w-full h-full flex items-end">
                        <div className="absolute bottom-0 left-[5%] w-[90%] h-[60%] blur-[120px] rounded-full bg-cyan-400/10 dark:bg-blue-900/15" />
                        <Image src="/study-char.png" alt="Zaeon Brain" fill className="object-contain object-bottom origin-bottom scale-95" priority />
                    </motion.div>
                </div>

                {/* GADGET DE SALAS (DIREITA) */}
                <div className="absolute inset-0 lg:static lg:col-span-5 flex flex-col justify-center items-center lg:items-start z-40 px-6">
                    <div className="flex flex-col gap-4 w-full max-w-[400px]">

                        {/* HIGHLIGHT BOX - FOCO EM COLETIVIDADE */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`px-6 py-4 rounded-[24px] flex items-center justify-center border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-3xl shadow-[0_10px_30px_rgba(34,211,238,0.1)]`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <UserGroupIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-900 dark:text-white">
                                    {t("study_rooms.highlight")} <span className="text-cyan-600 dark:text-cyan-400">Collective Network</span>
                                </span>
                            </div>
                        </motion.div>

                        {/* LISTA DE SALAS - O GADGET GÊMEO */}
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className={panelStyle}>

                            {/* Header Interno Sem Transbordo */}
                            <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-cyan-200">Nodes Active</span>
                                </div>
                                <WifiIcon className="w-4 h-4 text-slate-400 dark:text-white/20" />
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="pl-1">
                                    <h2 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                                        {t("study_rooms.find_party")}
                                    </h2>
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-slate-400 dark:text-white/40 font-black">
                                        Research Clusters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {ROOMS.map((room) => {
                                        const isSelected = selectedRoom === room.id;
                                        return (
                                            <button
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room.id)}
                                                className={`${cardBaseStyle} ${isSelected ? cardSelectedStyle : ""}`}
                                            >
                                                <div className={accentBar(isSelected)} />
                                                <div className="flex flex-col items-start pl-3">
                                                    <h3 className={`text-[14px] font-bold transition-colors ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-950 dark:text-white'}`}>
                                                        {t(`study_rooms.rooms.${room.nameKey}`)}
                                                    </h3>
                                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-40 text-slate-600 dark:text-cyan-200">
                                                        {t(`study_rooms.rooms.${room.topicKey}`)}
                                                    </span>
                                                </div>
                                                <ChevronRightIcon className={`h-4 w-4 transition-all ${isSelected ? 'opacity-100 translate-x-0 text-cyan-600' : 'opacity-0 -translate-x-2'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Botão de Ação Chamativo (VIBRANTE NO CLARO) */}
                            <div className="p-5 border-t border-white/10 bg-black/[0.05] dark:bg-black/20">
                                <button
                                    onClick={handleJoinRoom}
                                    disabled={!selectedRoom}
                                    className={`
                                        w-full py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-500 
                                        ${selectedRoom
                                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_10px_25px_rgba(34,211,238,0.5)] scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                                            : "bg-white/5 text-slate-400 dark:text-white/10 cursor-not-allowed border border-white/5"
                                        }
                                    `}
                                >
                                    {selectedRoom ? t("study_rooms.join") : t("study_rooms.select")}
                                </button>
                            </div>
                        </motion.div>

                        <p className="mt-4 text-[9px] text-center text-slate-400 dark:text-cyan-900/60 font-medium tracking-[0.3em] uppercase opacity-50">
                            &copy; Zaeon Collective Intelligence, 2026.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}