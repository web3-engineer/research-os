"use client";

import { useState, useEffect, useLayoutEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

// --- IMPORTAÇÃO CORRIGIDA ---
// Substituímos o antigo "hero" pelo novo "HeroPage" que tem a largura fixa.
import HeroPage from "@/components/sub/hero-content";

// Outros componentes
import Encryption from "@/components/main/encryption";
import StudyRoomsPage from "@/app/study-rooms/page";
import IntroOverlay from "@/src/components/main/intro-overlay";
import { Navbar } from "@/components/main/navbar";
import { Footer } from "@/components/main/footer";

// Carregamento dinâmico do background
const ParticleSystem = dynamic(
    () => import("@/components/main/ParticleSystem"),

);

export default function Home() {
    const { i18n } = useTranslation();
    const [showIntro, setShowIntro] = useState(true);
    const [startContent, setStartContent] = useState(false);

    const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

    // Bloqueia scroll durante a intro
    useEffect(() => {
        if (showIntro) {
            document.body.style.overflow = "hidden";
            window.scrollTo(0, 0);
        } else {
            const t = setTimeout(() => { document.body.style.overflow = ""; }, 100);
            return () => clearTimeout(t);
        }
    }, [showIntro]);

    useIsomorphicLayoutEffect(() => {
        window.history.scrollRestoration = "manual";
    }, []);

    const handleIntroComplete = () => {
        setShowIntro(false);
        // Pequeno delay para sincronizar com o fim do fade-out da intro
        setTimeout(() => {
            setStartContent(true);
        }, 400);
    };

    return (
        <main className="h-full w-full">
            <AnimatePresence mode="wait">
                {showIntro && (
                    <IntroOverlay key="intro-overlay" onDone={handleIntroComplete} />
                )}
            </AnimatePresence>

            {/* O conteúdo principal só renderiza após a intro */}
            {startContent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="relative flex flex-col h-full"
                >
                    {/* Background Global de Estrelas */}
                    {/* Nota: Se o seu HeroPage já tiver um StarBackground dentro dele, 
                        você pode remover este aqui ou remover o de dentro do HeroPage 
                        para evitar duplicidade e pesar o app. O ideal é manter ESTE aqui. */}
                    <ParticleSystem />

                    <Navbar />

                    <div className="flex flex-col gap-20">
                        {/* --- AQUI ESTÁ A CORREÇÃO --- */}
                        {/* Usamos o HeroPage que tem o w-full max-w-[520px] configurado */}
                        <HeroPage />

                        <Encryption />

                        <div id="study-rooms" className="w-full">
                            <Suspense fallback={null}>
                                <StudyRoomsPage />
                            </Suspense>
                        </div>
                    </div>

                    <Footer />
                </motion.div>
            )}
        </main>
    );
}