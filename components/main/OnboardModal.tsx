'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, BookOpen, Fingerprint,
    ChevronUp, ChevronDown, Mars, Venus, Lock,
    Upload, Copy, Move, Image as ImageIcon, Loader2, Minus, Maximize2
} from 'lucide-react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';

interface ZaeonAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: string;
}

const ZaeonAuthModal = ({ isOpen, onClose, role }: ZaeonAuthModalProps) => {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // --- ESTADOS SINCRONIZADOS COM BANCO DE DADOS ---
    const [name, setName] = useState('');
    const [age, setAge] = useState<number>(27);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [studyArea, setStudyArea] = useState(''); // Mapeia para 'course' no Prisma
    const [studentId, setStudentId] = useState(''); // Mapeia para 'identityId' no Prisma

    // Fotos em Base64 para persistência no MongoDB
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [torsoImage, setTorsoImage] = useState<string | null>(null);

    const isReadyToSign = name.length > 2 && studyArea.length > 2 && !isSubmitting;

    // Helper: Converte arquivo para string Base64
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    // --- CONFIGURAÇÃO DOS DROPZONES ---
    const onDropProfile = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const base64 = await convertToBase64(file);
            setProfileImage(base64);
        }
    }, []);

    const onDropTorso = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const base64 = await convertToBase64(file);
            setTorsoImage(base64);
        }
    }, []);

    const { getRootProps: getProfileProps, getInputProps: getProfileInput } = useDropzone({
        onDrop: onDropProfile, accept: { 'image/*': [] }, maxFiles: 1, noClick: !!profileImage
    });

    const { getRootProps: getTorsoProps, getInputProps: getTorsoInput } = useDropzone({
        onDrop: onDropTorso, accept: { 'image/*': [] }, maxFiles: 1, noDragEventsBubbling: true
    });

    // --- ENVIO PARA API ---
    const handleInitialize = async () => {
        setIsSubmitting(true);
        const onboardingData = {
            name, age, gender, course: studyArea, identityId: studentId, role,
            image: profileImage, torsoImage: torsoImage
        };

        try {
            await fetch('/api/auth/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(onboardingData),
            });
            await signIn('google', { callbackUrl: '/dashboard' });
        } catch (error) {
            console.error("Erro na sincronização:", error);
            setIsSubmitting(false);
        }
    };

    // --- EFEITOS E GESTÃO DE JANELA ---
    useEffect(() => {
        setMounted(true);
        if (isOpen && !isMinimized) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen, isMinimized]);

    // Physics Engine (Partículas)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!isOpen || !mounted || isMinimized) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize); resize();

        class Particle {
            x: number; y: number; vx: number; vy: number; text: string; size: number;
            constructor(text: string, w: number, h: number) {
                this.text = text; this.x = Math.random() * w; this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 10 + 10;
            }
            update(w: number, h: number) {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }
            draw(ctx: CanvasRenderingContext2D) {
                ctx.font = `${this.size}px monospace`;
                ctx.fillStyle = "rgba(16, 185, 129, 0.10)";
                ctx.fillText(this.text, this.x, this.y);
            }
        }
        const particles = Array.from({ length: 20 }).map(() => new Particle(role.toUpperCase(), canvas.width, canvas.height));
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(canvas.width, canvas.height); p.draw(ctx); });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, [isOpen, mounted, role, isMinimized]);

    const StringLine = ({ height }: { height: number }) => (
        <div className="absolute left-1/2 -translate-x-1/2 w-[1px] bg-gray-400/60 dark:bg-white/20 z-0 pointer-events-none" style={{ height: `${height}px`, top: `-${height}px` }} />
    );

    if (!mounted || !isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-0">
            <AnimatePresence mode="wait">
                {!isMinimized && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose}>
                        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
                    </motion.div>
                )}

                {!isMinimized && (
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10 w-full max-w-[950px] h-[720px] bg-gray-200/90 dark:bg-[#0f172a] rounded-2xl shadow-2xl overflow-hidden border border-white/50 dark:border-white/10 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* TRAFFIC LIGHTS */}
                        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 group/traffic">
                            <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-90 transition-all shadow-sm" />
                            <button onClick={() => setIsMinimized(true)} className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-90 transition-all shadow-sm" />
                            <button className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-90 transition-all shadow-sm" />
                        </div>

                        {/* --- LADO ESQUERDO --- */}
                        <div className="relative h-full p-8 flex flex-col items-center pt-14 overflow-y-auto no-scrollbar scroll-smooth">
                            <div className="absolute top-6 left-6 opacity-5 dark:opacity-10 text-5xl font-black uppercase tracking-tighter -rotate-12 pointer-events-none select-none text-black dark:text-white">{role}</div>

                            <div className="w-full flex flex-col gap-6 pb-24 mt-2">
                                {/* DADOS PESSOAIS */}
                                <motion.div drag dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }} className="relative z-30 w-full bg-white dark:bg-[#1e293b] rounded-xl p-5 border border-gray-100 dark:border-white/10 shadow-lg">
                                    <StringLine height={70} />
                                    <div className="flex items-center gap-2 mb-4 border-b border-dashed border-gray-200 pb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">Identity Protocol</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider ml-1">Full Name</label>
                                            <div className="flex items-center bg-gray-50 dark:bg-black/30 rounded-lg border border-gray-200 px-3 py-1">
                                                <User size={14} className="text-gray-400" />
                                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Subject Name" className="w-full bg-transparent border-none text-sm p-2 focus:ring-0 text-gray-900 dark:text-gray-200 outline-none" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider ml-1">Age Cycle</label>
                                                <div className="flex items-center justify-between bg-gray-100 dark:bg-[#0f172a] rounded-lg border p-1 h-11 border-gray-200 dark:border-white/10">
                                                    <button onClick={() => setAge(a => Math.max(1, a - 1))} className="px-2 text-gray-500"><ChevronDown size={14} /></button>
                                                    <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{age}</span>
                                                    <button onClick={() => setAge(a => a + 1)} className="px-2 text-gray-500"><ChevronUp size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider ml-1">Biometrics</label>
                                                <div className="relative flex h-11 bg-gray-100 dark:bg-[#0f172a] rounded-lg p-1 border cursor-pointer border-gray-200 dark:border-white/10">
                                                    <motion.div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md transition-all ${gender === 'male' ? 'bg-blue-500' : 'bg-pink-500 left-[50%]'}`} />
                                                    <button onClick={() => setGender('male')} className="flex-1 z-10 flex justify-center"><Mars size={16} className={gender === 'male' ? 'text-white' : 'text-gray-500'} /></button>
                                                    <button onClick={() => setGender('female')} className="flex-1 z-10 flex justify-center"><Venus size={16} className={gender === 'female' ? 'text-white' : 'text-gray-500'} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* ÁREA */}
                                <motion.div drag dragConstraints={{ left: -30, right: 30 }} className="relative z-20 w-full bg-white dark:bg-[#1e293b] rounded-xl p-5 border border-gray-100 dark:border-white/10 shadow-lg">
                                    <StringLine height={40} />
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen size={14} className="text-purple-500" />
                                        <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Knowledge Base</span>
                                    </div>
                                    <input type="text" value={studyArea} onChange={(e) => setStudyArea(e.target.value)} placeholder="Ex: Software Engineering" className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-xs focus:border-purple-500 outline-none text-slate-800 dark:text-white" />
                                </motion.div>
                            </div>

                            {/* FOOTER BOTÃO GOOGLE */}
                            <div className="absolute bottom-6 w-full px-12 z-50">
                                <button onClick={handleInitialize} disabled={!isReadyToSign} className={`w-full relative group font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 border ${isReadyToSign ? 'bg-white text-black hover:scale-[1.02] border-gray-200' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border-transparent cursor-not-allowed'}`}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Image src="https://authjs.dev/img/providers/google.svg" alt="G" width={20} height={20} />}
                                    <span className="text-sm">Sign in with Google</span>
                                </button>
                            </div>
                        </div>

                        {/* --- LADO DIREITO (PREVIEW CARD) --- */}
                        <div {...getTorsoProps()} className="relative hidden md:block border-l border-white/50 h-full overflow-hidden bg-gray-200/50 dark:bg-[#080d16] group cursor-pointer">
                            <input {...getTorsoInput()} />
                            
                            {/* Placeholder / Torso Image Container */}
                            {torsoImage ? (
                                <Image src={torsoImage} alt="Torso" fill className="object-cover transition-all duration-700 group-hover:scale-105" priority />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-white/20 bg-gradient-to-br from-transparent to-slate-300/20 dark:to-cyan-900/10">
                                    <ImageIcon size={48} className="mb-4 opacity-50 drop-shadow-md" />
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/50 dark:bg-black/30 px-4 py-2 rounded-full border border-white/40 dark:border-white/10 backdrop-blur-sm">Drop Cover Photo</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />

                            {/* FACE CIRCLE */}
                            <div {...getProfileProps()} className="absolute top-[15%] right-[28%] z-30 w-32 h-32 rounded-full border-2 border-blue-400 bg-blue-50/80 dark:bg-blue-900/50 backdrop-blur-md flex flex-col items-center justify-center text-center p-2 shadow-2xl group/circle cursor-pointer overflow-visible hover:scale-105 transition-transform">
                                <input {...getProfileInput()} />
                                {profileImage ? (
                                    <Image src={profileImage} alt="Profile" fill className="object-cover rounded-full" />
                                ) : (
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <Upload size={20} className="text-blue-500 mb-1" />
                                        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-300 uppercase">Upload Face</span>
                                    </div>
                                )}
                                <div className="absolute -bottom-3 bg-blue-600 p-1.5 rounded-full shadow-lg border-2 border-white/20 pointer-events-none"><Upload size={14} className="text-white" /></div>
                            </div>

                            <div className="absolute bottom-10 left-8 right-8 text-white z-10 pointer-events-none">
                                <div className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-400 font-mono mb-2 backdrop-blur-md">
                                    SYSTEM: {(studyArea || role).toUpperCase()}_MODE
                                </div>
                                <h2 className="text-2xl font-black truncate">{name || 'Unknown Subject'}</h2>
                                <p className="text-[10px] text-gray-300 leading-relaxed font-medium">This is how your profile card will be visible for others. You can change your photos later.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* MINIMIZED VIEW */}
                {isMinimized && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 right-6 z-[10000] pointer-events-auto">
                        <div onClick={() => setIsMinimized(false)} className="flex items-center gap-3 bg-gray-900/90 backdrop-blur-xl border border-white/10 p-3 pr-5 rounded-full shadow-2xl cursor-pointer hover:bg-gray-800 transition-colors border-l-4 border-l-green-500">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10">
                                {profileImage ? <Image src={profileImage} alt="U" fill className="object-cover" /> : <User size={16} className="text-white/50" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-green-400">Session Paused</span>
                                <span className="text-sm font-bold text-white">Click to Restore</span>
                            </div>
                            <Maximize2 size={16} className="text-white/30 ml-2" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ZaeonAuthModal;