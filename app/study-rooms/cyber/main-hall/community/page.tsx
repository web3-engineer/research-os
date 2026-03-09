"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
    HeartIcon,
    PaperAirplaneIcon,
    SparklesIcon,
    CpuChipIcon,
    BeakerIcon,
    GlobeAltIcon,
    UserGroupIcon,
    SignalIcon,
    ArrowDownIcon,
    MapPinIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

// --- TYPES ---
interface Comment {
    id: string;
    user: string;
    content: string;
    time: string;
}

interface Post {
    id: string;
    user: string;
    userImage?: string;
    content: string;
    time: string;
    likes: string[];
    isLiked: boolean;
    room: string;
    comments: Comment[];
}

// --- 1. GLOBO 3D (VISUAL & INTERATIVO) ---
const COLOR_TECH_BLUE = new THREE.Color("#001a2c");
const COLOR_WIRE_BLUE = new THREE.Color("#00d2ff");
const COLOR_DOT       = new THREE.Color("#22d3ee");

const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
};

// Marcador Interativo
const LocationMarker = ({ lat, lon, label, cost, onClick }: any) => {
    const ref = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const position = latLonToVector3(lat, lon, 1.55);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.lookAt(0, 0, 8); 
            const scale = hovered ? 1.3 : 1 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
            ref.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group position={position} ref={ref}>
            <mesh 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
            >
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color={hovered ? "#fbbf24" : COLOR_DOT} toneMapped={false} />
            </mesh>
            
            <Html distanceFactor={12} style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
                <AnimatePresence>
                    {hovered && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-black/90 backdrop-blur-md border border-cyan-500/50 p-3 rounded-xl w-32 shadow-[0_0_20px_rgba(6,182,212,0.3)] -mt-12 ml-4 pointer-events-none select-none"
                        >
                            <div className="flex items-center gap-2 mb-1 border-b border-white/10 pb-1">
                                <MapPinIcon className="w-3 h-3 text-cyan-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">{label}</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px]">
                                <span className="text-white/60 font-mono">Cost Index:</span>
                                <span className="text-emerald-400 font-bold">{cost}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Html>
        </group>
    );
};

const CyberGlobe = () => {
    const coreRef = useRef<THREE.Mesh>(null);
    const wireframeGroupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (wireframeGroupRef.current) wireframeGroupRef.current.rotation.y = t / 50;
        if (coreRef.current) coreRef.current.rotation.y = t / 45;
    });

    return (
        <group>
            <Sphere ref={coreRef} args={[1.5, 64, 64]}>
                <meshPhongMaterial color={COLOR_TECH_BLUE} transparent opacity={0.9} shininess={100} specular={new THREE.Color("#22d3ee")} />
            </Sphere>
            <group ref={wireframeGroupRef}>
                <Sphere args={[1.51, 32, 32]}>
                    <meshBasicMaterial color={COLOR_WIRE_BLUE} wireframe transparent opacity={0.12} />
                </Sphere>
                <LocationMarker lat={37.09} lon={-95.71} label="USA" cost="HIGH" onClick={() => {}} />
                <LocationMarker lat={-14.23} lon={-51.92} label="BRAZIL" cost="LOW" onClick={() => {}} />
                <LocationMarker lat={51.16} lon={10.45} label="GERMANY" cost="MED" onClick={() => {}} />
                <LocationMarker lat={35.86} lon={104.19} label="CHINA" cost="MED" onClick={() => {}} />
                <LocationMarker lat={-25.27} lon={133.77} label="AUSTRALIA" cost="HIGH" onClick={() => {}} />
                <LocationMarker lat={35.67} lon={139.65} label="JAPAN" cost="HIGH" onClick={() => {}} />
            </group>
        </group>
    );
};

// --- 2. CABO DE ENERGIA (SVG) ---
const EnergyCord = ({ startX, startY, endX, endY, delay = 0 }: any) => {
    const path = `M ${startX} ${startY} C ${startX} ${endY}, ${endX} ${startY}, ${endX} ${endY}`;
    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
            <path d={path} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <motion.path 
                d={path} fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="10 150" 
                initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -160 }} 
                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: delay }} 
                className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
            />
        </svg>
    );
};

// --- 3. LOADING SPINNER (APPLE STYLE) ---
const AppleSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="relative w-6 h-6">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute w-[2px] h-[5px] bg-white rounded-full left-1/2 top-0 -ml-[1px] origin-[50%_12px]" style={{ transform: `rotate(${i * 30}deg)`, animation: `apple-spinner 1.2s linear infinite`, animationDelay: `${-1.2 + i * 0.1}s`, opacity: 0.2 }} />
            ))}
        </div>
        <style jsx>{`@keyframes apple-spinner { 0% { opacity: 1; } 100% { opacity: 0.2; } }`}</style>
    </div>
);

// --- COMPONENTE DA PÁGINA ---
export default function LoungeEarth() {
    const { data: session } = useSession();
    
    const [globalMessage, setGlobalMessage] = useState("Synchronizing global network...");
    const [activeRoom, setActiveRoom] = useState("lounge");
    const [isLoadingFeed, setIsLoadingFeed] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState("");

    useEffect(() => {
        setTimeout(() => { setGlobalMessage("System Update 4.0: Quantum coherence achieved. Welcome to the Zaeon Network."); }, 1500);
        loadFeed("lounge");
    }, []);

    const loadFeed = async (room: string) => {
        setIsLoadingFeed(true);
        setActiveRoom(room);
        setTimeout(() => {
            const mockPosts: Post[] = Array.from({ length: 6 }).map((_, i) => ({
                id: Math.random().toString(),
                user: room === 'lounge' ? `Agent ${i + 10}` : `${room.toUpperCase()} Specialist`,
                userImage: "",
                content: `Secure transmission regarding ${room.toUpperCase()} sector. Data packet #${i + 884} authorized.`,
                time: `${i * 5 + 2}m ago`,
                likes: [],
                isLiked: false,
                room: room,
                comments: []
            }));
            setPosts(mockPosts);
            setIsLoadingFeed(false);
        }, 1000); 
    };

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        const post: Post = {
            id: Date.now().toString(),
            user: session?.user?.name || "Operative",
            userImage: session?.user?.image || "",
            content: newPost,
            time: "Just now",
            likes: [],
            isLiked: false,
            room: activeRoom,
            comments: []
        };
        setPosts([post, ...posts]);
        setNewPost("");
    };

    const rooms = [
        { id: 'cyber', label: 'Cyber', icon: <CpuChipIcon className="w-5 h-5" />, color: 'cyan' },
        { id: 'bio', label: 'Bio', icon: <BeakerIcon className="w-5 h-5" />, color: 'emerald' },
        { id: 'quantic', label: 'Quantic', icon: <GlobeAltIcon className="w-5 h-5" />, color: 'violet' },
        { id: 'humanities', label: 'Human', icon: <UserGroupIcon className="w-5 h-5" />, color: 'orange' },
    ];

    return (
        // Root Wrapper Totalmente Transparente. Depende do Background do Layout.
        <div className="relative w-full min-h-screen font-sans bg-transparent">
            
            {/* --- CAMADA 0: BACKGROUND FIXO (GLOBO + TÍTULO) --- */}
            {/* position: fixed mantém o globo sempre na tela enquanto a página rola */}
            <div className="fixed inset-0 z-0 flex flex-col items-center pointer-events-auto bg-transparent">
                
                {/* Título Fixo no Topo */}
                <div className="absolute top-10 w-full flex flex-col items-center z-10 pointer-events-none">
                    <h1 className="text-[10px] font-black uppercase tracking-[1em] text-slate-500 dark:text-white/40 flex items-center gap-4 drop-shadow-md">
                        <span className="w-8 h-[1px] bg-slate-300 dark:bg-white/20" />
                        Zaeon Global Network
                        <span className="w-8 h-[1px] bg-slate-300 dark:bg-white/20" />
                    </h1>
                </div>

                {/* Canvas 3D:
                    Z = 6.5 (Globo bem menor e visível inteiro)
                    Y = -1.8 (Câmera abaixou, empurrando o globo lá para cima na tela)
                */}
                <Canvas camera={{ position: [0, -1.8, 6.5], fov: 40 }} className="w-full h-full bg-transparent">
                    <ambientLight intensity={0.6} />
                    <pointLight position={[10, 10, 10]} intensity={2.5} />
                    <CyberGlobe />
                    {/* Interatividade liberada! Sem zoom para o scroll descer a página */}
                    <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.6} />
                </Canvas>
            </div>

            {/* --- CAMADA 1: CONTEÚDO ROLÁVEL (PARALLAX EFFECT) --- */}
            {/* IMPORTANTE: pointer-events-none aqui permite que o mouse passe reto e controle o globo no fundo */}
            <div className="relative z-10 w-full flex flex-col pointer-events-none">
                
                {/* 1. ESPAÇADOR HERÓI: Espaço vazio de 60vh para o globo brilhar sozinho */}
                <div className="w-full h-[60vh] flex flex-col items-center justify-end pb-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <ArrowDownIcon className="w-5 h-5 text-cyan-500 animate-bounce drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    </motion.div>
                </div>

                {/* 2. ÁREA DE MÓDULOS "VIDRO LÍQUIDO" */}
                {/* IMPORTANTE: pointer-events-auto reativado aqui para poder clicar nos botões e inputs! */}
                {/* Fundo ultra-transparente: bg-white/5 e dark:bg-black/20 para ver o globo passando por trás */}
                <div className="w-full min-h-screen bg-white/5 dark:bg-[#010816]/20 backdrop-blur-3xl border-t border-white/20 dark:border-white/10 rounded-t-[3rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] px-4 pt-16 pb-32 transition-colors duration-1000 pointer-events-auto relative">
                    
                    {/* Alça Decorativa */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full opacity-50"></div>

                    <div className="max-w-3xl mx-auto flex flex-col gap-12 relative z-10">

                        {/* A. ZAEON BANNER (HUB DE MENSAGEM) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="relative w-full"
                        >
                            <div className="absolute left-1/2 bottom-0 w-[2px] h-12 bg-gradient-to-b from-cyan-500/50 to-transparent translate-y-full z-0"></div>

                            {/* Cards de Vidro Real */}
                            <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md border border-cyan-500/30 rounded-[2rem] p-8 shadow-xl text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1">
                                        <SparklesIcon className="w-5 h-5 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Zaeon Broadcast</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-light text-slate-800 dark:text-white leading-relaxed font-mono px-4">
                                        &quot;{globalMessage}&quot;
                                    </h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                                        <span className="text-[9px] text-slate-500 dark:text-white/60 uppercase tracking-widest">Network Live</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* B. ROOM SELECTORS */}
                        <div className="relative w-full pt-4">
                            <div className="absolute -top-6 w-full h-10 pointer-events-none opacity-50">
                                <EnergyCord startX="50%" startY="0%" endX="12%" endY="100%" delay={0} />
                                <EnergyCord startX="50%" startY="0%" endX="37%" endY="100%" delay={0.3} />
                                <EnergyCord startX="50%" startY="0%" endX="63%" endY="100%" delay={0.6} />
                                <EnergyCord startX="50%" startY="0%" endX="88%" endY="100%" delay={0.9} />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                {rooms.map((room) => (
                                    <motion.button
                                        key={room.id}
                                        onClick={() => loadFeed(room.id)}
                                        whileHover={{ scale: 1.03, y: -4 }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`
                                            relative h-28 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-lg overflow-hidden group
                                            ${activeRoom === room.id 
                                                ? `bg-${room.color}-500/30 border-${room.color}-500/50 shadow-[0_0_25px_rgba(var(--${room.color}-rgb),0.3)]` 
                                                : 'bg-white/20 dark:bg-white/5 border-slate-200/50 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <div className={`p-2.5 rounded-full bg-white/40 dark:bg-white/10 ${activeRoom === room.id ? `text-${room.color}-600 dark:text-${room.color}-400` : 'text-slate-600 dark:text-white/60'}`}>
                                            {room.icon}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeRoom === room.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-white/80'}`}>
                                            {room.label}
                                        </span>
                                        {activeRoom === room.id && (
                                            <div className={`absolute bottom-0 w-full h-1 bg-${room.color}-500 shadow-[0_0_10px_currentColor]`} />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* C. FEED MODULE */}
                        <div className="w-full min-h-[600px] bg-white/30 dark:bg-black/20 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-white/5">
                                <div className="flex items-center gap-3">
                                    <SignalIcon className={`w-5 h-5 ${isLoadingFeed ? 'animate-pulse text-slate-500' : 'text-cyan-600 dark:text-cyan-400'}`} />
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">
                                        {activeRoom === 'lounge' ? 'Main Lounge Feed' : `${activeRoom} Sector Feed`}
                                    </h3>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-slate-300/50 dark:border-white/10 text-[9px] font-mono text-slate-600 dark:text-white/60">
                                    {isLoadingFeed ? 'SYNCING...' : 'LIVE'}
                                </div>
                            </div>

                            <div className="flex-1 p-6 md:p-8">
                                {isLoadingFeed ? (
                                    <div className="w-full h-60 flex items-center justify-center">
                                        <AppleSpinner />
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
                                        <form onSubmit={handlePostSubmit} className="mb-8 relative group">
                                            <input type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder={`Transmit to ${activeRoom.toUpperCase()}...`} className="w-full bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl py-4 pl-6 pr-12 text-sm text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white dark:focus:bg-black/40 transition-all shadow-inner backdrop-blur-md" />
                                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"><PaperAirplaneIcon className="w-5 h-5" /></button>
                                        </form>
                                        
                                        {posts.length > 0 ? posts.map((post) => (
                                            <FeedPost key={post.id} post={post} />
                                        )) : (
                                            <div className="text-center py-12 text-slate-500 dark:text-white/40 text-[10px] uppercase tracking-widest border-2 border-dashed border-slate-300/50 dark:border-white/10 rounded-xl backdrop-blur-sm">No signals detected.</div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTE: POST INDIVIDUAL ---
function FeedPost({ post }: { post: Post }) {
    return (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-5 rounded-3xl transition-all hover:bg-white hover:shadow-lg dark:hover:bg-white/10 hover:scale-[1.01]">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-white/10 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-white/10">
                    {post.userImage ? <img src={post.userImage} alt="" className="w-full h-full object-cover" /> : <UserCircleIcon className="w-6 h-6 text-slate-500 dark:text-white/50" />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800 dark:text-white/90">{post.user}</span>
                            <span className="text-[8px] text-slate-600 dark:text-white/60 font-mono uppercase bg-white/60 dark:bg-white/10 px-2 py-0.5 rounded border border-slate-200/50 dark:border-white/10">{post.room}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 dark:text-white/40 font-mono">{post.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-white/80 leading-relaxed font-medium mt-1">{post.content}</p>
                    <div className="flex gap-5 mt-4">
                        <button className="flex items-center gap-1.5 text-slate-500 dark:text-white/40 hover:text-red-500 transition-colors group">
                            {post.isLiked ? <HeartSolid className="w-4 h-4 text-red-500" /> : <HeartIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                            <span className="text-[10px] font-mono font-bold">{post.likes.length}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-slate-500 dark:text-white/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-mono font-bold">{post.comments.length}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}