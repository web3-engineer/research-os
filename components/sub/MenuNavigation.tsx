"use client";
import React, { useState } from "react";
import { 
  ChevronRightIcon, ChevronLeftIcon, ArrowLeftIcon, 
  ArrowRightStartOnRectangleIcon 
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// IMPORTANTE: Certifique-se que o caminho aqui aponta para o arquivo do MODAL que criamos
const OnboardModal = dynamic(() => import("@/components/main/OnboardModal"), { ssr: false });

const MENU_ITEMS = [
  { labelKey: "menu.new", href: "/signup" },
  { labelKey: "menu.load", href: "#" },
  { labelKey: "menu.options", href: "/settings" },
  { labelKey: "menu.manual", href: "/workstation/admin" },
];

// LISTA DE ROLES (Sem Cyber Hall)
const ROLES = [
  { slug: "student", key: "roles.student" },
  { slug: "researcher", key: "roles.researcher" },
  { slug: "professional", key: "roles.professional" },
  { slug: "entrepreneur", key: "roles.entrepreneur" },
] as const;

export default function MenuNavigation() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [index, setIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0); 
  const [pickerOpen, setPickerOpen] = useState(false); 
  const [onboardOpen, setOnboardOpen] = useState(false); // Controla o Modal
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.email === "zaeondao@gmail.com";

  const visibleMenuItems = MENU_ITEMS.filter(item => {
    if (item.labelKey === "menu.manual") return isAdmin;
    return true;
  });

  // Ajustado para usar o tom de azul (cyan-900/20) em ambos os modos
  const panelClass = "w-full mt-24 rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 bg-cyan-900/20 border border-cyan-400/30 shadow-2xl flex flex-col";
  
  // Ajustado para usar cyan-950/30 (o tom azul escuro e transparente) como base
  const cardBase = "group relative overflow-hidden flex items-center justify-between rounded-xl px-5 min-h-[64px] w-full transition-all duration-300 cursor-pointer font-bold text-white bg-cyan-950/30 hover:bg-cyan-900/40 border border-white/5 hover:border-cyan-400/20 hover:scale-[1.01]";
  
  const cardSelected = "ring-1 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-cyan-900/40";
  const accentBar = (active: boolean) => `absolute left-0 top-0 h-full w-[4px] transition-all duration-300 ${active ? "bg-cyan-400 opacity-100" : "bg-transparent opacity-0"}`;

  return (
    <div className={panelClass}>
      <nav className="px-4 sm:px-6 py-8 min-h-[350px] w-full flex flex-col">
        <AnimatePresence mode="wait">
          {!isOptionsOpen ? (
            <motion.ul 
              key="main" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex flex-col gap-3 w-full"
            >
              
              {/* ITEM 0: NEW ACCOUNT / SELETOR */}
              <li className="w-full" onMouseEnter={() => setIndex(0)} onClick={() => !isLoggedIn && setPickerOpen(true)}>
                <div className={`${cardBase} ${index === 0 ? cardSelected : ""}`}>
                  <div className={accentBar(index === 0)} />
                  <span className="truncate pr-2 flex-1">{isLoggedIn ? `${session?.user?.name || 'User'} Lv.1` : t("menu.new")}</span>
                  
                  {!isLoggedIn && pickerOpen ? (
                    <div className="flex items-center gap-2 bg-black/80 p-1 rounded-lg border border-white/10 shrink-0 z-20">
                      <ChevronLeftIcon 
                        className="w-4 h-4 cursor-pointer hover:text-cyan-400 transition-colors" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setRoleIndex(r => (r - 1 + ROLES.length) % ROLES.length); 
                        }} 
                      />
                      
                      <span 
                        className="text-[11px] min-w-[110px] text-center uppercase tracking-tighter hover:text-cyan-400 cursor-pointer select-none" 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            setOnboardOpen(true); 
                        }}
                      >
                        {t(ROLES[roleIndex].key)}
                      </span>
                      
                      <ChevronRightIcon 
                        className="w-4 h-4 cursor-pointer hover:text-cyan-400 transition-colors" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setRoleIndex(r => (r + 1) % ROLES.length); 
                        }} 
                      />
                    </div>
                  ) : <ChevronRightIcon className="h-5 w-5 opacity-40 shrink-0" />}
                </div>
              </li>

              {visibleMenuItems.slice(1).map((item, i) => {
                const isSel = index === i + 1;
                return (
                  <li key={item.labelKey} className="w-full" onMouseEnter={() => setIndex(i + 1)} onClick={() => {
                    if (item.labelKey === "menu.options") setIsOptionsOpen(true);
                    else if (item.labelKey === "menu.load" && !isLoggedIn) signIn('google');
                    else router.push(item.href);
                  }}>
                    <div className={`${cardBase} ${isSel ? cardSelected : ""}`}>
                      <div className={accentBar(isSel)} />
                      <span className="truncate pr-2 flex-1">{t(item.labelKey)}</span>
                      <ChevronRightIcon className="h-5 w-5 opacity-40 shrink-0" />
                    </div>
                  </li>
                );
              })}
            </motion.ul>
          ) : (
            <motion.div 
              key="options" 
              initial={{ x: 20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              className="flex flex-col gap-4 w-full"
            >
               <button onClick={() => setIsOptionsOpen(false)} className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-2 w-full">
                 <ArrowLeftIcon className="w-4 h-4" /> {t("menu.back")}
               </button>

               <div className={cardBase}>
                 <div className="flex flex-col flex-1">
                   <span className="text-[10px] opacity-60 uppercase">{t("options.language")}</span>
                   <span className="text-[15px]">{i18n.language.toUpperCase()}</span>
                 </div>
                 <select 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                   value={i18n.language} 
                   onChange={(e) => i18n.changeLanguage(e.target.value)}
                 >
                   <option value="en">English</option>
                   <option value="pt">Português</option>
                   <option value="es">Español</option>
                   <option value="zh">中文</option>
                   <option value="ko">한국어</option>
                   <option value="fr">Français</option>
                   <option value="de">Deutsch</option>
                 </select>
                 <ChevronRightIcon className="h-5 w-5 opacity-40 shrink-0" />
               </div>

               <div className={`${cardBase} hover:bg-red-500/10`} onClick={() => signOut()}>
                 <div className="flex flex-col flex-1">
                   <span className="text-[10px] opacity-60 uppercase">Session</span>
                   <span className="text-[15px]">{t("menu.logout", "Disconnect")}</span>
                 </div>
                 <ArrowRightStartOnRectangleIcon className="h-5 w-5 opacity-40 shrink-0" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      <div className="px-6 pb-7 text-[11px] opacity-55 text-white tracking-widest">{t("footer.version")}</div>
      
      {onboardOpen && (
        <OnboardModal 
          isOpen={onboardOpen} 
          onClose={() => setOnboardOpen(false)} 
          role={ROLES[roleIndex].slug} 
        />
      )}
    </div>
  );
}