"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Componentes Internos
import MenuNavigation from "@/components/sub/MenuNavigation";
import GameHint from "@/src/components/ui/game-hint";

export default function HeroPage() {
  const { t } = useTranslation();

  // Estados para controlar o Scroll e visibilidade
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);

  // Lógica de Scroll (Esconde ao descer, mostra ao subir)
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

  // Transição suave
  const transition = { duration: 1.5, ease: [0.23, 1, 0.32, 1] };

  return (
    <main className="w-full min-h-screen flex justify-start items-start relative px-4 md:pl-20 py-12 overflow-hidden bg-white dark:bg-[#05080a] transition-colors duration-700">

      {/* 2. IMAGEM LATERAL */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: show ? 0 : "100%", opacity: show ? 1 : 0 }}
        transition={transition}
        className="absolute -right-80 top-20 bottom-0 w-[85vw] h-[900px] max-w-none pointer-events-none z-10 hidden lg:block overflow-hidden"
      >
        <Image
          src="/assets/zaeon-ai.png"
          alt="Workstation Image"
          fill
          className="object-right object-top object-contain opacity-95"
          priority
        />
      </motion.div>

      {/* 3. CONTEÚDO PRINCIPAL (TRAVADO EM 520px) */}
      {/* AQUI ESTÁ A CORREÇÃO: w-full max-w-[520px] força a largura da coluna */}
      <div className="flex flex-col items-start z-20 w-full max-w-[420px]">

        {/* Menu Navigation preenchendo 100% dos 520px */}
        <motion.div
          className="w-full"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: show ? 0 : "-100%", opacity: show ? 1 : 0 }}
          transition={transition}
        >
          <MenuNavigation />
        </motion.div>

        {/* Game Hints alinhado com a mesma largura */}
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