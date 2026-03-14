"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Componentes Internos
import MenuNavigation from "../sub/MenuNavigation";
import GameHint from "@/src/components/ui/game-hint";

export default function GraphicContent() {
  const { t } = useTranslation();

  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShow(false);
      } else {
        setShow(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const transition = { duration: 1.5, ease: [0.23, 1, 0.32, 1] };

  return (
    <main className="w-full min-h-screen flex justify-start items-start relative px-4 md:pl-20 py-12 overflow-hidden bg-transparent transition-colors duration-700">

      {/* A IMAGEM 'computer.png' E AS CAMADAS DE GLITCH FORAM REMOVIDAS DAQUI 
          PARA DAR DESTAQUE TOTAL AO FUNDO DINÂMICO DO ZAEON OS.
      */}

      {/* 3. CONTEÚDO PRINCIPAL (COLUNA DA ESQUERDA) */}
      <div className="flex flex-col items-start z-20 w-full max-w-[420px]">
        {/* Menu Navigation */}
        <motion.div
          className="w-full"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: show ? 0 : "-100%", opacity: show ? 1 : 0 }}
          transition={transition}
        >
          <MenuNavigation />
        </motion.div>

        {/* Game Hints */}
        <motion.div
          className="mt-4 w-full"
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: show ? 0 : "-120%", opacity: show ? 1 : 0 }}
          transition={{ ...transition, delay: 0.1 }}
        >
          <GameHint
            isVisible={show}
            hints={[
              t("hints.new_game", "DICA: Inicie com um perfil novo para conferir a tecnologia."),
              t("hints.save_progress", "DICA: Conecte sua conta Google para salvar progresso."),
              t("hints.roles", "DICA: Cada classe libera ferramentas exclusivas.")
            ]}
          />
        </motion.div>
      </div>
    </main>
  );
}