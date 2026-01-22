"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import { PlayIcon, XMarkIcon, CpuChipIcon, ShieldCheckIcon, GlobeAltIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const SponsorsTicker = ({ opacity }: { opacity: any }) => {
  const { t } = useTranslation();

  const sponsors = [
    { name: "Funcap", src: "/sponsors/funcap.jpg", url: "https://www.funcap.ce.gov.br/" },
    { name: "Centelha", src: "/sponsors/centelha.png", url: "https://programacentelha.com.br/ce/" },
    { name: "Sudene", src: "/sponsors/sudene.png", url: "https://www.gov.br/sudene" },
    { name: "Finep", src: "/sponsors/finep.png", url: "http://www.finep.gov.br/" },
    { name: "Governo", src: "/sponsors/gov.svg", url: "https://www.gov.br/" },
  ];

  const tickerItems = [...sponsors, ...sponsors, ...sponsors];

  return (
    <motion.div 
      style={{ opacity }} 
      className="w-full py-12 overflow-hidden relative"
    >
     <div className="w-full flex justify-center mb-12">
      <h3 className="text-center text-[14px] font-black tracking-[0.6em] text-cyan-600 dark:text-cyan-400 uppercase">    
        {t("hero.sponsors_title", "APOIADORES:")}
      </h3>
    </div>

      <div className="relative">
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#030014] via-transparent to-[#030014]" />
        <div className="flex whitespace-nowrap">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
            className="flex gap-6 px-6"
          >
            {tickerItems.map((item, i) => (
              <SponsorCard key={i} item={item} />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const SponsorCard = ({ item }: { item: { name: string; src: string; url: string } }) => {
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ 
        scale: 1.05, 
        borderColor: "rgba(34, 211, 238, 0.4)",
        backgroundColor: "rgba(255, 255, 255, 0.05)" 
      }}
      className="relative flex items-center justify-center min-w-[280px] h-[140px] rounded-[2rem] border border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl transition-all duration-500 group overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12)_0%,transparent_70%)]" />
      <div className="relative w-full h-full p-8 flex items-center justify-center">
        <img src={item.src} alt={item.name} className="max-w-full max-h-full object-contain transition-all duration-500 transform group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="absolute bottom-2 right-6 opacity-0 group-hover:opacity-40 transition-opacity text-[8px] text-cyan-400 tracking-widest uppercase">Visit Website</div>
    </motion.a>
  );
};

const TypingEffect = ({ text, className }: { text: string; className: string }) => {
    const characters = Array.from(text);
    return (
        <motion.div className={className} style={{ whiteSpace: "nowrap" }}>
            {characters.map((char, i) => (
                <motion.span key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.03, delay: i * 0.02 }} viewport={{ once: true }}>
                    {char}
                </motion.span>
            ))}
        </motion.div>
    );
};

export default function Encryption() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
    const scale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.95, 1.35, 1.35, 0.85]);
    const videoOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.1, 1, 1, 0]);
    const sponsorsOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.85, 1], [0, 1, 1, 0]);

    if (!mounted) return <div className="min-h-screen bg-transparent" />;

    return (
        <section ref={sectionRef} className="relative z-[30] min-h-[220vh] w-full bg-transparent flex flex-col items-center pt-40 overflow-x-hidden">
            <div className="w-full max-w-7xl text-center mb-16 px-4">
                <TypingEffect text="Um novo jeito de produzir ciência." className="text-slate-900 dark:text-white text-[6vw] md:text-[64px] font-extralight tracking-tighter" />
            </div>

            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pointer-events-none">
                <motion.div style={{ scale, opacity: videoOpacity }} className="relative w-[95%] max-w-[1200px] aspect-video bg-zinc-900 shadow-[0_0_80px_rgba(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden group cursor-pointer pointer-events-auto" onClick={() => setIsVideoOpen(true)}>
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover"><source src="/assets/encryption-bg.mp4" type="video/mp4" /></video>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"><PlayIcon className="w-20 h-20 text-white drop-shadow-2xl" /></div>
                </motion.div>
                <div className="w-full pointer-events-auto"><SponsorsTicker opacity={sponsorsOpacity} /></div>
            </div>

            {/* --- NOVOS FEATURE CARDS (FINAL DA PÁGINA) --- */}
            <div className="relative z-50 w-full max-w-7xl mx-auto px-6 mt-40 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { 
                            title: "Redes Neurais Especializadas", 
                            desc: "Integração profunda com modelos de IA da mais alta tecnologia para análise de dados científicos e produções acadêmicas detalhadas.", 
                            icon: "https://authjs.dev/img/providers/google.svg" 
                        },
                        { 
                            title: "Infraestrutura Blockchain", 
                            desc: "Segurança de ponta para proteção de propriedade intelectual, patentes e registro de progresso dentro da rede Cronos.", 
                            icon: "https://cryptologos.cc/logos/cronos-cro-logo.png" 
                        },
                        { 
                            title: "Infraestrutura Gamificada", 
                            desc: "Rede distribuída para colaboração acadêmica sem fronteiras não precisa ser chata. a Zaeon torna o processo acadêmico divertido, viciante e recompensador.", 
                            icon: "/zaeon-logo.png" 
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ 
                                y: -10, 
                                borderColor: "rgba(34, 211, 238, 0.5)",
                                boxShadow: "0 0 40px rgba(34, 211, 238, 0.1)" 
                            }}
                            className="p-8 rounded-[2rem] border border-white/10 bg-[#0a0a0f]/60 backdrop-blur-xl group transition-all duration-500 relative overflow-hidden"
                        >
                            {/* Brilho de fundo no hover */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="mb-8 relative">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/5 transition-all duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                    <img 
                                        src={feature.icon} 
                                        alt={feature.title} 
                                        className="w-full h-full object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500" 
                                    />
                                </div>
                                <div className="absolute top-1/2 left-20 right-0 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                            </div>

                            <h4 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:text-cyan-400 transition-colors duration-500">
                                {feature.title}
                            </h4>

                            <p className="text-sm text-white font-normal leading-relaxed opacity-100">
                                {feature.desc}
                            </p>

                            <div className="absolute bottom-4 right-4 w-1 h-1 bg-white/20 rounded-full group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_#22d3ee] transition-all" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* MODAL DO VÍDEO */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                        <button onClick={() => setIsVideoOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><XMarkIcon className="w-10 h-10" /></button>
                        <div className="w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl">
                            <iframe className="w-full h-full" src="https://www.youtube.com/embed/SuaIDAqui?autoplay=1" allow="autoplay; fullscreen" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}