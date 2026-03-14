"use client";

import { useEffect, useRef } from "react";

export default function GlobalClickSound() {
    const clickSfx = useRef<HTMLAudioElement | null>(null);
    const hoverSfx = useRef<HTMLAudioElement | null>(null);
    const backSfx = useRef<HTMLAudioElement | null>(null); // NOVO: Som de Voltar
    const lastElement = useRef<EventTarget | null>(null);

    useEffect(() => {
        // Inicializa os 3 arquivos
        clickSfx.current = new Audio("/assets/sounds/mouse-click.mp3");
        hoverSfx.current = new Audio("/assets/sounds/menu-hover.mp3");
        backSfx.current = new Audio("/assets/sounds/menu-back.mp3"); // Verifique se este arquivo existe
        
        clickSfx.current.volume = 0.3;
        hoverSfx.current.volume = 0.1;
        backSfx.current.volume = 0.3;

        const handleGlobalInteraction = (e: MouseEvent) => {
            // REGRA MESTRE: Respeita a opção On/Off do Menu
            const sfxEnabled = localStorage.getItem("zaeon_sfx") !== "false";
            if (!sfxEnabled) return;

            const target = e.target as HTMLElement;
            if (!target) return;

            // Filtro de Interatividade
            const interactiveElement = target.closest('button, a, select') || 
                                     (window.getComputedStyle(target).cursor === "pointer" ? target : null);

            if (!interactiveElement) return;

            // --- LÓGICA DE CLIQUE (MOUSEDOWN) ---
            if (e.type === "mousedown") {
                const text = interactiveElement.textContent?.toLowerCase() || "";
                
                // Verifica se é um botão de "Voltar" ou "Back"
                const isBackButton = text.includes("voltar") || 
                                   text.includes("back") || 
                                   (interactiveElement instanceof HTMLElement && interactiveElement.dataset.sfx === "back");

                const sfxToPlay = isBackButton ? backSfx.current : clickSfx.current;

                if (sfxToPlay) {
                    const clone = sfxToPlay.cloneNode() as HTMLAudioElement;
                    clone.volume = sfxToPlay.volume;
                    clone.play().catch(() => {});
                }
            }

            // --- LÓGICA DE HOVER (MOUSEOVER) ---
            if (e.type === "mouseover") {
                if (lastElement.current === interactiveElement) return;
                lastElement.current = interactiveElement;

                if (hoverSfx.current) {
                    const clone = hoverSfx.current.cloneNode() as HTMLAudioElement;
                    clone.volume = 0.1;
                    clone.play().catch(() => {});
                }
            }
        };

        document.addEventListener("mousedown", handleGlobalInteraction);
        document.addEventListener("mouseover", handleGlobalInteraction);

        return () => {
            document.removeEventListener("mousedown", handleGlobalInteraction);
            document.removeEventListener("mouseover", handleGlobalInteraction);
        };
    }, []);

    return null;
}