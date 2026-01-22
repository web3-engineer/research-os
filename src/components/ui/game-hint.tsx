"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

interface GameHintProps {
  hints: string[];
  isVisible: boolean;
}

export default function GameHint({ hints, isVisible }: GameHintProps) {
  const [currentHint, setCurrentHint] = useState(0);

  // Rotaciona as dicas automaticamente a cada 8 segundos
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % hints.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isVisible, hints.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="mt-4 w-full max-w-[480px] group relative"
        >
          {/* Background com Vidro e Brilho */}
          <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-black/40 p-4 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            
            {/* Barra lateral de "Alerta" */}
            <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500 shadow-[0_0_10px_#22d3ee]" />

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <ExclamationTriangleIcon className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="flex-1">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">
                  SYSTEM_AGENT
                </h4>
                <motion.p 
                  key={currentHint}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-1 text-[13px] font-medium leading-relaxed text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                >
                  {hints[currentHint]}
                </motion.p>
              </div>
            </div>

            {/* Decoração de Canto (Estilo HUD) */}
            <div className="absolute bottom-1 right-1 h-1 w-1 bg-cyan-500/50" />
            <div className="absolute bottom-1 right-3 h-[1px] w-4 bg-cyan-500/20" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}