"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import MenuNavigation from "./MenuNavigation";
import GameHint from "@/src/components/ui/game-hint";
import { useTranslation } from "react-i18next";

export default function HeroSceneController() {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);

  // LARGURA FIXA PARA EVITAR DISCREPÂNCIA ENTRE IDIOMAS
  const fixedWidth = "w-[520px] min-w-[520px] max-w-[820px]";
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) setShow(false);
      else setShow(true);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const transition = { duration: 1.5, ease: [0.23, 1, 0.32, 1] };

  return (
    <>


      {/* CONTEÚDO PRINCIPAL - COLUNA COM LARGURA TRAVADA */}
      <div className={`flex flex-col items-start z-20 ${fixedWidth}`}>

        <motion.div
          className="w-full"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: show ? 0 : "-100%", opacity: show ? 1 : 0 }}
          transition={transition}
        >
          {/* Passamos a largura total para o componente de menu */}
          <MenuNavigation />
        </motion.div>

        <motion.div
          className="mt-4 w-full"
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: show ? 0 : "-120%", opacity: show ? 1 : 0 }}
          transition={{ ...transition, delay: 0.1 }}
        >
          <GameHint
            isVisible={show}
            hints={[
              t("hints.new_game"),
              t("hints.save_progress"),
              t("hints.roles")
            ]}
          />
        </motion.div>
      </div>
    </>
  );
}