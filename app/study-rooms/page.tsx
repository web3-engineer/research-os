"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
    UserGroupIcon,
    CpuChipIcon,
    BeakerIcon,
    CalculatorIcon,
    GlobeAltIcon,
    WifiIcon,
    BookOpenIcon,
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";

export default function StudyRoomsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const ROOMS = [
         {
            id: 1,
            nameKey: "global_name",
            topicKey: "global_topic",
            users: 310,
            ping: "ONLINE",
            icon: GlobeAltIcon,
            color: "text-blue-300",
            bg: "bg-blue-500/20",
            route: "/study-rooms/lounge"
        },
        {
            id: 2,
            nameKey: "cyber_name",
            topicKey: "cyber_topic",
            users: 142,
            ping: "ONLINE",
            icon: CpuChipIcon,
            color: "text-cyan-300",
            bg: "bg-cyan-500/20",
            route: "/study-rooms/cyber"
        },
        {
            id: 3,
            nameKey: "bio_name",
            topicKey: "bio_topic",
            users: 89,
            ping: "ONLINE",
            icon: BeakerIcon,
            color: "text-green-300",
            bg: "bg-green-500/20",
            route: "/study-rooms/bio"
        },
        {
            id: 4,
            nameKey: "quantum_name",
            topicKey: "quantum_topic",
            users: 56,
            ping: "OFFLINE",
            icon: CalculatorIcon,
            color: "text-purple-300",
            bg: "bg-purple-500/20",
            route: "/study-rooms/quantic"
        },
       {
            id: 5,
            nameKey: "humanities_name",
            topicKey: "humanities_topic",
            icon: BookOpenIcon,
            color: "text-purple-300",
            bg: "bg-purple-500/20",
            route: "/study-rooms/humanities"
        },
    ];

    const handleJoinRoom = () => {
        if (!selectedRoom) return;
        const room = ROOMS.find((r) => r.id === selectedRoom);
        if (room?.route) {
            router.push(room.route);
        }
    };

    // --- ESTILOS SINCRONIZADOS COM A HERO PAGE ---

    // Painel: Preto no Modo Claro / Azul Ciano Glass no Modo Escuro
    const panelStyle = [
        "backdrop-blur-xl transition-all duration-500",
        // Claro
        "bg-black/60 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
        // Escuro
        "dark:bg-cyan-900/20 dark:border-cyan-400/30 dark:shadow-[0_0_60px_rgba(34,211,238,0.15)]",
        "after:pointer-events-none after:absolute after:inset-0 after:opacity-[0.1] after:bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
    ].join(" ");

    // Cards: Botões escuros/translúcidos com texto branco
    const cardBaseStyle = [
        "group relative overflow-hidden flex items-center justify-between rounded-xl px-4 py-3",
        "transition-all duration-300 ease-out cursor-pointer",
        "font-bold tracking-wide",
        "text-white", // Texto sempre branco
        // Claro
        "bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/20",
        // Escuro
        "dark:bg-cyan-950/30 dark:hover:bg-cyan-900/50 dark:border-cyan-400/10 dark:hover:border-cyan-400/30",
        "hover:scale-[1.02] active:scale-[0.98] shadow-sm"
    ].join(" ");

    // Selecionado: Glow Azul Ciano
    const cardSelectedStyle = "ring-1 ring-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.02] bg-black/50 dark:bg-cyan-900/40";

    const accentBar = (active: boolean) => [
        "absolute left-0 top-0 h-full w-[4px] transition-all duration-300",
        active 
            ? "bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] opacity-100" 
            : "bg-transparent w-[0px] opacity-0 group-hover:bg-white/10"
    ].join(" ");


    if (!mounted) {
        return (
            <div className="w-full h-screen bg-[#eef2f6] dark:bg-[#030014] overflow-hidden relative flex items-center justify-center">
                <MatrixRain />
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#eef2f6] dark:bg-[#030014] text-white overflow-hidden relative flex items-center justify-center transition-colors duration-500">

            <MatrixRain />

            {/* --- CYBER FRAME --- */}
            <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between">
                <div className="w-full h-24 relative flex items-start justify-center">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                    <div className="absolute top-3 left-8 flex items-center gap-2 opacity-60">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-sm animate-ping" />
                        <span className="text-[9px] font-mono text-slate-600 dark:text-cyan-300 tracking-[0.2em] font-bold">{t("study_rooms.system")}</span>
                    </div>
                    <div className="absolute top-3 right-8 opacity-60">
                        <span className="text-[9px] font-mono text-slate-500 dark:text-white/50 tracking-widest font-bold">
                            {t("study_rooms.secure")}: <span className="text-purple-600 dark:text-purple-400">{t("study_rooms.encrypted")}</span>
                        </span>
                    </div>
                </div>
                <div className="absolute top-24 bottom-10 left-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
                <div className="absolute top-24 bottom-10 right-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />

                {/* Footer Frame Limpo */}
                <div className="w-full h-16 relative bg-gradient-to-t from-slate-300 via-slate-200/50 to-transparent dark:from-[#030014] dark:via-[#030014]/80 flex items-end justify-center pb-4">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="z-20 w-full max-w-[1700px] h-full grid grid-cols-1 lg:grid-cols-12 gap-0 relative">

                {/* --- COLUNA ESQUERDA: PERSONAGEM --- */}
                <div className="absolute bottom-0 left-0 w-full h-full lg:static lg:col-span-7 lg:h-full flex items-end justify-center lg:justify-start pointer-events-none z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative w-full h-full flex items-end"
                    >
                        <div className="absolute bottom-0 left-[5%] w-[90%] h-[60%] blur-[100px] rounded-full bg-slate-400/30 dark:bg-blue-900/15" />
                        <Image
                            src="/study-char.png"
                            alt="Zaeon Brain"
                            fill
                            className="object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_60px_rgba(0,0,0,0.9)] scale-100 origin-bottom"
                            priority
                        />
                    </motion.div>
                </div>

                {/* --- COLUNA DIREITA: GADGET + HIGHLIGHT --- */}
                <div className="absolute inset-0 lg:static lg:col-span-5 lg:h-auto lg:w-full px-6 flex flex-col justify-center items-center lg:items-start z-40 pb-16 lg:pb-0 pointer-events-none lg:pointer-events-auto">
                    <div className="pointer-events-auto flex flex-col items-center lg:items-start w-full">

                        {/* Highlight */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34, 211, 238, 0.3)" }}
                            transition={{ duration: 0.5 }}
                            // Apliquei o novo estilo PANEL aqui também
                            className={`relative w-full max-w-[400px] mb-4 px-6 py-4 flex items-center justify-center gap-3 rounded-2xl cursor-default overflow-hidden ${panelStyle}`}
                        >
                            <span className="text-sm font-bold font-mono tracking-[0.15em] uppercase drop-shadow-sm text-white text-center leading-tight relative z-10">
                                {t("study_rooms.highlight")} <span className="text-cyan-300">{t("study_rooms.together")}</span>
                            </span>
                        </motion.div>

                        {/* Gadget Principal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 50 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className={`relative w-full max-w-[400px] rounded-3xl overflow-hidden ${panelStyle}`}
                        >
                            {/* Header */}
                            <div className="h-12 flex items-center justify-between px-5 border-b border-white/10 bg-white/5 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" />
                                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-cyan-200">{t("study_rooms.lobby_status")}</span>
                                </div>
                                <WifiIcon className="w-4 h-4 text-white/30" />
                            </div>

                            {/* Lista */}
                            <div className="p-5 space-y-4 relative z-10">
                                <div>
                                    <h2 className="text-xl font-bold leading-none text-white">{t("study_rooms.find_party")}</h2>
                                    <p className="text-[10px] mt-1 uppercase tracking-wide text-white/50">{t("study_rooms.select_cluster")}</p>
                                </div>

                                <div className="space-y-2.5">
                                    {ROOMS.map((room) => {
                                        const isSelected = selectedRoom === room.id;
                                        return (
                                            <motion.button
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room.id)}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`${cardBaseStyle} w-full text-left ${isSelected ? cardSelectedStyle : ""}`}
                                            >
                                                <span className={accentBar(isSelected)} />
                                                <div className="flex items-center justify-between w-full pl-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-md bg-black/20 ${room.color}`}>
                                                            <room.icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-white transition-colors">{t(`study_rooms.rooms.${room.nameKey}`)}</h3>
                                                            <p className="text-[9px] uppercase tracking-wider text-cyan-200/80 font-medium">{t(`study_rooms.rooms.${room.topicKey}`)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center justify-end gap-1 text-[10px] mb-0.5 text-white/60">
                                                            <UserGroupIcon className="w-3 h-3" /> {room.users}
                                                        </div>
                                                        <div className="text-[9px] font-mono text-green-400">{room.ping}</div>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer do Gadget */}
                            <div className="p-4 border-t border-white/10 bg-black/20 relative z-10">
                                <button
                                    onClick={handleJoinRoom}
                                    disabled={!selectedRoom}
                                    className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2 ${selectedRoom ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "bg-white/5 text-white/20 cursor-not-allowed"}`}
                                >
                                    {selectedRoom ? t("study_rooms.join") : t("study_rooms.select")}
                                </button>
                            </div>
                        </motion.div>
                        
                        {/* COPYRIGHT FOOTER */}
                        <div className="mt-8 text-center w-full max-w-[400px]">
                             <p className="text-[10px] text-slate-500 dark:text-cyan-900/60 font-medium tracking-wider uppercase opacity-70">
                                &copy; Zaeon - Zenith of Artificial & Earthly Organisms Network, 2026.
                             </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}