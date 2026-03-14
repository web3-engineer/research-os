"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

// Definimos o caminho da imagem como uma constante
const LOGO_DEFAULT = "/assets/zaeon-brain.png";

type Props = {
    show?: boolean;
    onDone?: () => void;
    minDurationMs?: number;
    logoSrc?: StaticImageData | string;
    hint?: string;
};

export default function MacSplash({
    show = true,
    onDone,
    minDurationMs = 3000,
    logoSrc = LOGO_DEFAULT,
}: Props) {
    const [hasStarted, setHasStarted] = useState(false); // NOVO: Controla se o usuário já clicou
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
    const [visible, setVisible] = useState(show);
    const [opacity, setOpacity] = useState(0);
    const [contentScale, setContentScale] = useState(1);
    const [contentBlur, setContentBlur] = useState(0);
    const startedAt = useRef<number | null>(null);
    const exitingRef = useRef(false);

    const prefersReducedMotion = useMemo(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
        []
    );

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    // Efeito 1: Lida apenas com a aparição inicial da tela (Fade In)
    useEffect(() => {
        if (!show) return;
        setVisible(true);
        const openT = setTimeout(() => setOpacity(1), 10);
        
        if (typeof window !== "undefined") {
            window.history.scrollRestoration = "manual";
            window.scrollTo(0, 0);
        }
        return () => clearTimeout(openT);
    }, [show]);

    // Efeito 2: A animação de loading, que SÓ RODA se hasStarted for true
    useEffect(() => {
        if (!show || !hasStarted) return; // Barra segura o carregamento aqui

        let raf = 0;
        const loop = (ts: number) => {
            if (!startedAt.current) startedAt.current = ts;
            const elapsed = ts - startedAt.current;
            const total = Math.max(1, minDurationMs);
            const t = Math.min(1, elapsed / total);
            const eased = prefersReducedMotion ? t : ease(t);

            setProgress(eased);

            if (!exitingRef.current && typeof window !== "undefined") {
                window.scrollTo(0, 0);
            }

            if (eased >= 0.9 && phase < 4) setPhase(4);
            else if (eased >= 0.69 && phase < 3) setPhase(3);
            else if (eased >= 0.51 && phase < 2) setPhase(2);
            else if (eased >= 0.33 && phase < 1) setPhase(1);

            if (t < 1) {
                raf = requestAnimationFrame(loop);
            } else if (!exitingRef.current) {
                exitingRef.current = true;

                if (typeof window !== "undefined") window.scrollTo(0, 0);

                if (!prefersReducedMotion) {
                    setContentScale(0.985);
                    setContentBlur(4);
                }
                setOpacity(0);
                setTimeout(() => {
                    onDone?.();
                    setVisible(false);
                    startedAt.current = null;
                    exitingRef.current = false;
                    setProgress(0);
                    setPhase(0);
                    setContentScale(1);
                    setContentBlur(0);
                }, prefersReducedMotion ? 0 : 260);
            }
        };

        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [show, hasStarted, minDurationMs, prefersReducedMotion, phase, onDone]);

    // Efeito 3: Lida com a saída forçada caso a prop 'show' mude
    useEffect(() => {
        if (!show && visible && !exitingRef.current) {
            exitingRef.current = true;
            if (!prefersReducedMotion) {
                setContentScale(0.985);
                setContentBlur(4);
            }
            setOpacity(0);
            const t = setTimeout(() => {
                onDone?.();
                setVisible(false);
                exitingRef.current = false;
            }, prefersReducedMotion ? 0 : 220);
            return () => clearTimeout(t);
        }
    }, [show, visible, prefersReducedMotion, onDone]);

    // Função disparada no clique da logo
    const handleInitiate = () => {
        if (hasStarted) return;
        
        // 1. Toca o som de boot/música (substitua o caminho pelo seu arquivo)
        const audio = new Audio("/assets/boot-music.mp3");
        audio.play().catch(err => console.error("Erro ao reproduzir áudio:", err));

        // 2. Inicia o carregamento visual
        setHasStarted(true);
    };

    if (!visible) return null;

    const zhPhrase =
        phase >= 4 || phase === 3
            ? "世界之希望已诞生"
            : phase === 2
                ? "日月星辰皆为吾家"
                : phase === 1
                    ? "万物归一"
                    : "";

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-300"
            style={{ opacity }}
            role="status"
            aria-label="Carregando"
        >
            <div
                className="flex flex-col items-center justify-center px-6 transition-[transform,filter] duration-300"
                style={{
                    transform: `scale(${contentScale})`,
                    filter: contentBlur ? `blur(${contentBlur}px)` : "none",
                }}
            >
                {/* Logo transformado em botão de ignição antes de iniciar */}
                <button 
                    onClick={handleInitiate}
                    className={`flex flex-col items-center justify-center transition-all duration-300 ${
                        !hasStarted 
                            ? "cursor-pointer hover:scale-105 hover:opacity-100 opacity-80" 
                            : "cursor-default opacity-95"
                    }`}
                    disabled={hasStarted}
                >
                    <Image
                        src={logoSrc}
                        alt="Zaeon"
                        width={100}
                        height={100}
                        priority
                        className="mb-4"
                    />
                    
                    {!hasStarted && (
                        <span className="text-white/80 tracking-[0.2em] text-xs font-medium animate-pulse">
                            INITIATE ZAEON
                        </span>
                    )}
                </button>

                {/* Container que altera entre o aviso dos fones e a barra de carregamento */}
                <div className="h-[60px] flex flex-col items-center justify-start mt-6 w-full">
                    {!hasStarted ? (
                        <div className="text-center text-[10px] tracking-widest leading-tight text-sky-400/70 font-light mt-4">
                            FOR A BETTER EXPERIENCE, USE HEADPHONES
                        </div>
                    ) : (
                        <>
                            {/* Barra de Progresso */}
                            <div className="w-[200px] h-[3px] rounded-full bg-white/15 overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.max(0.02, progress) * 100}%`,
                                        transition: prefersReducedMotion
                                            ? "none"
                                            : "width 120ms cubic-bezier(.22,.61,.36,1)",
                                        background:
                                            "linear-gradient(90deg,rgba(255,255,255,.9),rgba(230,236,255,.95),rgba(255,255,255,.9))",
                                        boxShadow: "0 0 8px rgba(255,255,255,0.35)",
                                        transform: "translateZ(0)",
                                        willChange: "width",
                                    }}
                                />
                            </div>

                            {/* Frase em Mandarim */}
                            {zhPhrase && (
                                <div
                                    className="mt-6 text-center text-[10px] tracking-widest leading-tight text-sky-400/90 font-light"
                                    style={{
                                        fontFamily: `"Noto Sans SC", "Microsoft YaHei", sans-serif`,
                                    }}
                                    aria-hidden="true"
                                >
                                    {zhPhrase}
                                </div>
                            )}

                            {/* Logs do Terminal */}
                            <div
                                className="mt-4 text-center text-[9px] leading-tight text-white/60"
                                style={{
                                    fontFamily:
                                        `"Ubuntu Mono","SF Mono","Menlo","Consolas","Liberation Mono",monospace`,
                                }}
                                aria-live="polite"
                            >
                                {phase >= 1 && <p>[ OK ] mounting zaeon kernel modules — 33%</p>}
                                {phase >= 2 && <p>[ OK ] linking research graph services — 51%</p>}
                                {phase >= 3 && <p>[ OK ] starting ai-mentors daemons — 69%</p>}
                                {phase >= 4 && (
                                    <p className="pt-1 text-white/75 tracking-wide">
                                        zaeon state initiated.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}