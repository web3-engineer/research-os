"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

const LOGO_DEFAULT = "/assets/zaeon-brain.png";

const TIMELINE = {
    AUDIO_SRC: "/assets/sounds/boot-track.mp3",
    TOTAL_DURATION: 7.0,
    STAGE_2_BAR_APPEARS: 0.1,
    STAGE_3_MOD_1_START: 1.8,
    STAGE_4_MOD_2_START: 3.6,
    STAGE_5_MOD_3_START: 5.4,
};

type Props = {
    show?: boolean;
    onDone?: () => void;
    logoSrc?: StaticImageData | string;
};

export default function MacSplash({ show = true, onDone, logoSrc = LOGO_DEFAULT }: Props) {
    const [hasStarted, setHasStarted] = useState(false);
    const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
    const [visible, setVisible] = useState(show);
    const [opacity, setOpacity] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const percentText1Ref = useRef<HTMLSpanElement>(null);
    const percentText2Ref = useRef<HTMLSpanElement>(null);
    const percentText3Ref = useRef<HTMLSpanElement>(null);

    const isAudioPlaying = useRef(false);
    const startTimeRef = useRef<number | null>(null);
    const exitingRef = useRef(false);
    const phaseRef = useRef<0 | 1 | 2 | 3 | 4>(0);

    const onDoneRef = useRef(onDone);
    useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

    useEffect(() => {
        if (!show) return;
        setVisible(true);
        const openT = setTimeout(() => setOpacity(1), 10);
        return () => clearTimeout(openT);
    }, [show]);

    useEffect(() => {
        if (!show || !hasStarted) return;
        let raf = 0;
        const loop = () => {
            const realTimeElapsed = (performance.now() - (startTimeRef.current || performance.now())) / 1000;
            const audioTime = (isAudioPlaying.current && audioRef.current && !audioRef.current.ended)
                ? audioRef.current.currentTime : realTimeElapsed;
            const time = Math.max(audioTime, realTimeElapsed);

            let currentGlobalPercent = 0;
            if (time >= TIMELINE.STAGE_5_MOD_3_START) {
                if (phaseRef.current < 4) { phaseRef.current = 4; setPhase(4); }
                const elapsed = time - TIMELINE.STAGE_5_MOD_3_START;
                currentGlobalPercent = 75 + Math.min((elapsed / 1.6) * 25, 25);
                if (percentText3Ref.current) percentText3Ref.current.innerText = Math.floor(currentGlobalPercent).toString();
            } else if (time >= TIMELINE.STAGE_4_MOD_2_START) {
                if (phaseRef.current < 3) { phaseRef.current = 3; setPhase(3); }
                const elapsed = time - TIMELINE.STAGE_4_MOD_2_START;
                currentGlobalPercent = 40 + Math.min((elapsed / 1.8) * 35, 35);
                if (percentText2Ref.current) percentText2Ref.current.innerText = Math.floor(currentGlobalPercent).toString();
            } else if (time >= TIMELINE.STAGE_3_MOD_1_START) {
                if (phaseRef.current < 2) { phaseRef.current = 2; setPhase(2); }
                const elapsed = time - TIMELINE.STAGE_3_MOD_1_START;
                currentGlobalPercent = Math.min((elapsed / 1.8) * 40, 40);
                if (percentText1Ref.current) percentText1Ref.current.innerText = Math.floor(currentGlobalPercent).toString();
            } else if (time >= TIMELINE.STAGE_2_BAR_APPEARS) {
                if (phaseRef.current < 1) { phaseRef.current = 1; setPhase(1); }
                currentGlobalPercent = 1;
            }

            if (progressBarRef.current) progressBarRef.current.style.width = `${currentGlobalPercent}%`;

            if (time < TIMELINE.TOTAL_DURATION && !exitingRef.current) {
                raf = requestAnimationFrame(loop);
            } else if (!exitingRef.current) {
                exitingRef.current = true;
                setOpacity(0);
                setTimeout(() => {
                    onDoneRef.current?.();
                    setVisible(false);
                    // IMPORTANTE: Não matamos o áudio aqui, ele continua para a Home.
                }, 300);
            }
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [show, hasStarted]);

    const handleInitiate = () => {
        if (hasStarted) return;

        startTimeRef.current = performance.now();

        // Tenta encontrar o áudio que a Navbar já preparou
        const audio = (window as any).zaeonAudio;

        if (audio) {
            audio.play().then(() => {
                isAudioPlaying.current = true;
                setHasStarted(true);
                // Avisa a Navbar para subir as barrinhas
                window.dispatchEvent(new CustomEvent("zaeon-music-sync"));
            }).catch((err: any) => {
                console.warn("Bloqueio de áudio:", err);
                setHasStarted(true);
            });
        } else {
            // Fallback caso a Navbar demore a carregar
            setHasStarted(true);
        }
    };

    if (!visible) return null;

    const zhPhrase = phase >= 4 ? "世界之希望已诞生" : phase >= 3 ? "日月星辰皆为吾家" : phase >= 1 ? "万物归一" : "";

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-300" style={{ opacity }}>
            <div className="flex flex-col items-center justify-center px-6">
                <button onClick={handleInitiate} className={`flex flex-col items-center justify-center transition-all duration-300 ${!hasStarted ? "cursor-pointer hover:scale-105 opacity-80" : "cursor-default"}`} disabled={hasStarted}>
                    <Image src={logoSrc} alt="Zaeon" width={100} height={100} priority className="mb-4" />
                    {!hasStarted && <span className="text-white/80 tracking-[0.2em] text-xs font-medium animate-pulse">CLICK TO START ZAEON</span>}
                </button>

                <div className="h-[80px] flex flex-col items-center justify-start mt-6 w-full">
                    {!hasStarted ? (
                        <div className="text-center text-[10px] tracking-widest text-sky-400/70 font-light mt-4 uppercase">For a better experience, use headphones</div>
                    ) : (
                        <>
                            <div className={`w-[200px] h-[3px] rounded-full bg-white/15 overflow-hidden transition-opacity duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                                <div ref={progressBarRef} className="h-full rounded-full" style={{ width: "0%", background: "linear-gradient(90deg,rgba(255,255,255,.9),rgba(230,236,255,.95),rgba(255,255,255,.9))", boxShadow: "0 0 8px rgba(255,255,255,0.35)", transition: "none" }} />
                            </div>
                            {zhPhrase && <div className="mt-6 text-center text-[10px] tracking-widest text-sky-400/90 font-light">{zhPhrase}</div>}
                            <div className="mt-4 text-center text-[9px] leading-tight text-white/60 space-y-1 font-mono uppercase">
                                {phase >= 2 && <p>[ OK ] mounting zaeon kernel modules — <span ref={percentText1Ref}>0</span>%</p>}
                                {phase >= 3 && <p>[ OK ] linking research graph services — <span ref={percentText2Ref}>40</span>%</p>}
                                {phase >= 4 && (
                                    <>
                                        <p>[ OK ] starting ai-mentors daemons — <span ref={percentText3Ref}>75</span>%</p>
                                        <p className="pt-2 text-white/80 tracking-wide font-medium animate-pulse">zaeon state initiated.</p>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}