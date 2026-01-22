"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChatBubbleLeftRightIcon, XMarkIcon, MinusIcon, 
    PaperAirplaneIcon, ChevronLeftIcon, UserCircleIcon,
    MagnifyingGlassIcon, EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

// Tipos para simular dados reais
type Message = {
    id: number;
    sender: "me" | "them";
    text: string;
    time: string;
};

type User = {
    id: number;
    name: string;
    status: "online" | "offline" | "busy";
    avatar?: string;
    rank?: string;
};

const MOCK_USERS: User[] = [
    { id: 1, name: "Dr. Aristhos", status: "online", rank: "1" },
    { id: 2, name: "Elena Volkov", status: "busy", rank: "2" },
    { id: 3, name: "Morfeu.eth", status: "offline", rank: "3" },
    { id: 4, name: "Alice Dev", status: "online", rank: "4" },
];

export const LoungeChatWidget = () => {
    // Estados da UI
    const [isOpen, setIsOpen] = useState(true); // Começa aberto ou fechado?
    const [activeView, setActiveView] = useState<"list" | "chat">("list");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userTab, setUserTab] = useState<"buddies" | "top">("buddies");

    // Estado das Mensagens (Mock para chat real)
    const [messageInput, setMessageInput] = useState("");
    const [chatHistory, setChatHistory] = useState<Message[]>([
        { id: 1, sender: "them", text: "Olá! Vi que você está estudando os módulos de Bio-tech.", time: "10:00" },
        { id: 2, sender: "me", text: "Sim! Estou fascinado com o projeto Zaeon.", time: "10:02" }
    ]);

    // Ref para scroll automático
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [chatHistory, activeView]);

    // Função para entrar no chat
    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setActiveView("chat");
    };

    // Função para voltar à lista
    const handleBackToList = () => {
        setActiveView("list");
        setSelectedUser(null);
    };

    // Função de Enviar Mensagem
    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageInput.trim()) return;

        // Adiciona mensagem do usuário
        const newMessage: Message = {
            id: Date.now(),
            sender: "me",
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistory((prev) => [...prev, newMessage]);
        setMessageInput("");

        // Simula resposta "Real"
        setTimeout(() => {
            setChatHistory((prev) => [...prev, {
                id: Date.now() + 1,
                sender: "them",
                text: "Isso é muito interessante. Podemos colaborar no próximo paper?",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 2000);
    };

    // Estilos Glassmorphism
    const glassStyle = `
        dark:bg-[#0f172a]/95 bg-white/90
        backdrop-blur-xl border dark:border-white/10 border-slate-200
        shadow-2xl overflow-hidden
    `;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1, height: isOpen ? 500 : 48, width: isOpen ? 340 : 280 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed bottom-0 right-8 z-50 rounded-t-2xl flex flex-col ${glassStyle}`}
        >
            {/* --- HEADER (Sempre Visível) --- */}
            <div 
                onClick={() => !isOpen && setIsOpen(true)}
                className="h-12 flex items-center justify-between px-4 bg-[#0f172a] dark:bg-white/5 border-b dark:border-white/5 cursor-pointer shrink-0"
            >
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                        {isOpen ? (selectedUser ? selectedUser.name : "Zaeon Messenger") : "Chat Online (4)"}
                    </span>
                </div>
                
                {/* Controles da Janela */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                        className="p-1 hover:bg-white/10 rounded text-white"
                    >
                        {isOpen ? <MinusIcon className="w-4 h-4" /> : <ChatBubbleLeftRightIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* --- CONTEÚDO EXPANDIDO --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {/* VISÃO 1: LISTA DE USUÁRIOS */}
                        {activeView === "list" && (
                            <>
                                {/* Abas */}
                                <div className="flex p-2 gap-2 bg-slate-100 dark:bg-black/20">
                                    <button 
                                        onClick={() => setUserTab("buddies")}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${userTab === "buddies" ? "bg-white dark:bg-white/10 shadow text-[#0f172a] dark:text-white" : "text-slate-400"}`}
                                    >
                                        Buddies
                                    </button>
                                    <button 
                                        onClick={() => setUserTab("top")}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${userTab === "top" ? "bg-white dark:bg-white/10 shadow text-[#0f172a] dark:text-white" : "text-slate-400"}`}
                                    >
                                        Top Rated
                                    </button>
                                </div>

                                {/* Busca */}
                                <div className="px-4 py-2 relative">
                                    <MagnifyingGlassIcon className="absolute left-7 top-4 w-3 h-3 text-slate-400" />
                                    <input type="text" placeholder="Buscar pesquisador..." className="w-full bg-slate-100 dark:bg-white/5 rounded-full py-1.5 pl-8 pr-4 text-xs outline-none dark:text-white" />
                                </div>

                                {/* Lista */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    {MOCK_USERS.map(user => (
                                        <div 
                                            key={user.id} 
                                            onClick={() => handleUserClick(user)}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                        >
                                            <div className="relative">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[#0f172a] dark:text-white font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0f172a] ${user.status === 'online' ? 'bg-green-500' : user.status === 'busy' ? 'bg-red-500' : 'bg-slate-400'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-bold text-[#0f172a] dark:text-slate-200">{user.name}</h4>
                                                <p className="text-[10px] text-slate-400 group-hover:text-[#0f172a] dark:group-hover:text-white transition-colors">
                                                    {user.status === 'online' ? 'Online agora' : 'Visto por último 2h atrás'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* VISÃO 2: CHAT ATIVO */}
                        {activeView === "chat" && selectedUser && (
                            <>
                                {/* Barra de Navegação do Chat */}
                                <div className="px-4 py-2 border-b dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
                                    <button onClick={handleBackToList} className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 hover:text-[#0f172a] dark:hover:text-white">
                                        <ChevronLeftIcon className="w-3 h-3" /> Voltar
                                    </button>
                                    <EllipsisHorizontalIcon className="w-5 h-5 text-slate-400 cursor-pointer" />
                                </div>

                                {/* Área de Mensagens */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-50/50 dark:bg-black/20">
                                    {chatHistory.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                                                msg.sender === 'me' 
                                                ? 'bg-[#0f172a] text-white rounded-br-none' 
                                                : 'bg-white dark:bg-white/10 text-[#0f172a] dark:text-slate-200 border dark:border-transparent border-slate-200 rounded-bl-none shadow-sm'
                                            }`}>
                                                {msg.text}
                                                <div className={`text-[8px] mt-1 opacity-50 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                                                    {msg.time}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input de Texto */}
                                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#0f172a] border-t dark:border-white/10 flex gap-2">
                                    <input 
                                        type="text" 
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Digite sua mensagem..." 
                                        className="flex-1 bg-slate-100 dark:bg-white/5 rounded-full px-4 py-2 text-xs outline-none text-[#0f172a] dark:text-white"
                                    />
                                    <button type="submit" className="p-2 bg-[#0f172a] dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-transform">
                                        <PaperAirplaneIcon className="w-4 h-4" />
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};