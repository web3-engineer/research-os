"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ChartBarIcon, IdentificationIcon, CurrencyDollarIcon,
    ArrowLeftIcon, SparklesIcon, DocumentChartBarIcon,
    SunIcon, MoonIcon, PlusIcon, PhotoIcon, 
    GlobeAmericasIcon, TrashIcon, LanguageIcon, 
    PuzzlePieceIcon, RocketLaunchIcon, CalendarDaysIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";

// --- APPLE STYLE LOADER ---
const AppleLoader = ({ status }: { status: string }) => (
    <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative w-10 h-10">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute w-[3px] h-[10px] bg-slate-400 dark:bg-white/40 left-[18.5px] top-0 rounded-full origin-[1.5px_20px]"
                    style={{ transform: `rotate(${i * 30}deg)`, animation: `appleSpinner 1s linear infinite`, animationDelay: `${i * 0.083}s` }} />
            ))}
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-white/30 tracking-[0.2em] uppercase animate-pulse">{status}</span>
    </div>
);

// --- TYPES ---
interface UserRequest { id: string; name: string; email: string; role: string; submittedAt: string; }
type Locale = "pt" | "en" | "zh" | "es" | "fr";

interface NewsPost {
    id: string;
    title: Record<Locale, string> | string;
    subtitle: Record<Locale, string> | string;
    content: Record<Locale, string> | string;
    imageUrl: string;
    publishDate: string;
    status: "published" | "draft";
    category: "news" | "report"; 
}

interface PluginData {
    id: string; name: string; author: string; description: string;
    category: "Essencial" | "Agentes" | "Mentorias" | "Blockchain";
    tag: string; price: number; actionUrl: string; status: string;
    isLocked: boolean; unlockRequirement: string;
}

export default function AdminControlRoom() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"credentials" | "reports" | "plugins" | "payments">("plugins"); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentLocale, setCurrentLocale] = useState<Locale>("pt");

    const [newsList, setNewsList] = useState<NewsPost[]>([]);
    const [pluginList, setPluginList] = useState<PluginData[]>([]);
    const [requests, setRequests] = useState<UserRequest[]>([]);
    const [selectedReq, setSelectedReq] = useState<UserRequest | null>(null);

    const [currentPost, setCurrentPost] = useState<NewsPost>({
        id: '', title: { pt: '', en: '', zh: '', es: '', fr: '' },
        subtitle: { pt: '', en: '', zh: '', es: '', fr: '' },
        content: { pt: '', en: '', zh: '', es: '', fr: '' },
        imageUrl: '', publishDate: new Date().toISOString().split('T')[0],
        status: 'draft', category: 'news' 
    });

    const [currentPlugin, setCurrentPlugin] = useState<PluginData>({
        id: '', name: '', author: 'Zaeon Core', description: '',
        category: 'Essencial', tag: '', price: 0, actionUrl: '', status: 'active',
        isLocked: false, unlockRequirement: ''
    });

    useEffect(() => { 
        setMounted(true);
        setIsDarkMode(document.documentElement.classList.contains('dark'));
    }, []);

    useEffect(() => {
        if (activeTab === 'credentials') fetchQueue();
        if (activeTab === 'reports') fetchNews();
        if (activeTab === 'plugins') fetchPlugins();
    }, [activeTab]);

    const fetchQueue = async () => { const res = await fetch('/api/admin'); if (res.ok) setRequests(await res.json()); };
    const fetchNews = async () => { const res = await fetch('/api/news'); if (res.ok) setNewsList(await res.json()); };
    const fetchPlugins = async () => { const res = await fetch('/api/plugins'); if (res.ok) setPluginList(await res.json()); };

    const handleSavePost = async () => {
        const payload = { ...currentPost };
        if (!payload.id) delete (payload as any).id;
        const res = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { alert("📡 Neural Feed Sincronizado."); fetchNews(); }
    };

    const handleDeletePlugin = async (id: string) => {
        if (!confirm("🚨 Tem certeza? Este plugin será deletado permanentemente da loja para todos os usuários.")) return;
        try {
            const res = await fetch(`/api/plugins?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("🗑️ Módulo removido com sucesso.");
                fetchPlugins(); 
                if (currentPlugin.id === id) {
                    setCurrentPlugin({ id: '', name: '', author: 'Zaeon Core', description: '', category: 'Essencial', tag: '', price: 0, actionUrl: '', status: 'active', isLocked: false, unlockRequirement: '' });
                }
            } else { alert("❌ Erro ao deletar módulo."); }
        } catch (e) { alert("❌ Erro de conexão com o banco."); }
    };

    const handleSavePlugin = async () => {
        const payload = { ...currentPlugin };
        if (!payload.id) delete (payload as any).id;
        const res = await fetch('/api/plugins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { alert("🛠 Module Deployed."); fetchPlugins(); }
    };

    const getPostTitle = (post: NewsPost, locale: Locale) => {
        if (!post.title) return "Untitled";
        if (typeof post.title === 'string') return post.title; 
        return post.title[locale] || post.title.pt || "Untitled";
    };

    if (!mounted) return <AppleLoader status="Initializing" />;

    const glassPanel = "bg-white/80 dark:bg-cyan-950/10 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-2xl";

    return (
        <div className="fixed inset-0 z-[500] bg-slate-50 dark:bg-[#030014] flex font-sans overflow-hidden transition-colors duration-500">
            <div className="absolute inset-0 z-0 opacity-20 hidden dark:block"><MatrixRain /></div>

            {/* SIDEBAR */}
            <motion.nav
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                className="fixed left-6 z-[550] flex flex-col py-8 rounded-[35px] border shadow-2xl backdrop-blur-2xl bg-white/80 dark:bg-black/80 border-slate-200 dark:border-white/10 h-[calc(100vh-48px)] top-6"
            >
                <div className="flex flex-col gap-3 px-3 mt-12">
                    <SidebarItem icon={IdentificationIcon} label="Queue" active={activeTab === 'credentials'} onClick={() => setActiveTab('credentials')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={PuzzlePieceIcon} label="Plugins" active={activeTab === 'plugins'} onClick={() => setActiveTab('plugins')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={DocumentChartBarIcon} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={CurrencyDollarIcon} label="Finance" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} isOpen={isSidebarOpen} />
                </div>
                <button onClick={() => router.push('/')} className="mt-auto mx-auto p-4 text-slate-400 hover:text-red-500 transition-colors"><ArrowLeftIcon className="w-6 h-6" /></button>
            </motion.nav>

            <main className="flex-1 pl-32 pr-8 py-8 h-full flex flex-col relative z-10">
                
                {/* --- MÓDULO QUEUE (CREDENTIALS) RESTAURADO --- */}
                {activeTab === 'credentials' && (
                    <div className="flex-1 flex gap-8 overflow-hidden">
                        <div className={`w-[400px] rounded-[45px] flex flex-col overflow-hidden ${glassPanel}`}>
                            <div className="p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Node Queue</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {requests.map((req) => (
                                    <div key={req.id} onClick={() => setSelectedReq(req)} className={`p-6 rounded-[28px] transition-all border cursor-pointer ${selectedReq?.id === req.id ? 'bg-cyan-500 border-cyan-400 text-black shadow-2xl' : 'bg-white/40 dark:bg-white/5 border-transparent hover:border-cyan-500/30'}`}>
                                        <h3 className="text-sm font-bold">{req.name}</h3>
                                        <p className="text-[11px] opacity-60 font-medium">{req.email}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={`flex-1 rounded-[45px] p-10 overflow-y-auto relative ${glassPanel}`}>
                            {selectedReq ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                    <h1 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">{selectedReq.name}</h1>
                                    <div className="grid grid-cols-2 gap-6">
                                        <DetailBoard title="Target Role" value={selectedReq.role} icon={IdentificationIcon} isActive={true} />
                                        <DetailBoard title="Submission" value={new Date(selectedReq.submittedAt).toLocaleDateString()} icon={CalendarDaysIcon} isActive={false} />
                                    </div>
                                    <button className="w-full bg-cyan-500 text-black font-black py-5 rounded-[28px] shadow-2xl uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform">Authorize Soulbound Access</button>
                                </motion.div>
                            ) : <div className="h-full flex items-center justify-center opacity-10 font-black uppercase tracking-[0.5em]">Select Node to Inspect</div>}
                        </div>
                    </div>
                )}

                {/* --- MÓDULO REPORTS (NEURAL FEED) --- */}
                {activeTab === 'reports' && (
                    <div className="flex-1 flex gap-8 overflow-hidden">
                        <div className={`w-[320px] rounded-[45px] flex flex-col overflow-hidden ${glassPanel}`}>
                            <div className="p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">Neural Feed</h2>
                                <button onClick={() => setCurrentPost({ id: '', title: { pt: '', en: '', zh: '', es: '', fr: '' }, subtitle: { pt: '', en: '', zh: '', es: '', fr: '' }, content: { pt: '', en: '', zh: '', es: '', fr: '' }, imageUrl: '', publishDate: new Date().toISOString().split('T')[0], status: 'draft', category: 'news' })} className="p-2 bg-slate-950 dark:bg-cyan-500 text-white dark:text-black rounded-full shadow-lg"><PlusIcon className="w-4 h-4" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {newsList.map((post) => (
                                    <div key={post.id} onClick={() => setCurrentPost(post)} className={`p-5 rounded-3xl cursor-pointer transition-all border ${currentPost.id === post.id ? 'bg-cyan-500/10 border-cyan-500' : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'}`}>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{getPostTitle(post, currentLocale)}</h4>
                                        <p className="text-[9px] opacity-40 mt-1 uppercase font-black tracking-widest">{post.category} • {post.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`flex-1 rounded-[45px] flex flex-col relative overflow-hidden ${glassPanel}`}>
                            <div className="absolute top-8 right-8 z-20 flex items-center gap-4">
                                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                                    {(["pt", "en", "zh", "es"] as Locale[]).map((lang) => (
                                        <button key={lang} onClick={() => setCurrentLocale(lang)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${currentLocale === lang ? 'bg-white dark:bg-cyan-500 text-black shadow-md' : 'text-slate-400'}`}>{lang.toUpperCase()}</button>
                                    ))}
                                </div>
                                <button onClick={handleSavePost} className="px-8 py-3 rounded-2xl bg-slate-950 dark:bg-cyan-500 text-white dark:text-black font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3"><GlobeAmericasIcon className="w-5 h-5" /> Global Sync</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 pt-28 custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-10">
                                    <div className="w-full h-56 rounded-[35px] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-black/20 group">
                                        {currentPost.imageUrl ? (
                                            <img src={currentPost.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : <><PhotoIcon className="w-10 h-10 text-slate-300 mb-2" /><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Post Header Image</span></>}
                                        <input type="text" placeholder="Paste Image URL..." className="absolute bottom-4 bg-white/90 dark:bg-black/70 px-4 py-2 rounded-xl text-[10px] w-2/3 outline-none border border-slate-200 dark:border-white/10" value={currentPost.imageUrl} onChange={(e) => setCurrentPost({...currentPost, imageUrl: e.target.value})} />
                                    </div>

                                    <div className="space-y-4">
                                        <input type="text" placeholder="Post Title..." className="w-full bg-transparent text-5xl font-black outline-none border-none placeholder:text-slate-200 dark:placeholder:text-white/10" 
                                            value={typeof currentPost.title === 'string' ? currentPost.title : currentPost.title[currentLocale]} 
                                            onChange={(e) => {
                                                if (typeof currentPost.title === 'string') {
                                                    setCurrentPost({...currentPost, title: { pt: e.target.value, en: '', zh: '', es: '', fr: '' }})
                                                } else {
                                                    setCurrentPost({...currentPost, title: {...currentPost.title, [currentLocale]: e.target.value}})
                                                }
                                            }} 
                                        />
                                        <input type="text" placeholder="Brief summary or subtitle..." className="w-full bg-transparent text-xl font-bold text-slate-400 outline-none border-none" 
                                            value={typeof currentPost.subtitle === 'string' ? currentPost.subtitle : currentPost.subtitle[currentLocale]} 
                                            onChange={(e) => {
                                                if (typeof currentPost.subtitle === 'string') {
                                                    setCurrentPost({...currentPost, subtitle: { pt: e.target.value, en: '', zh: '', es: '', fr: '' }})
                                                } else {
                                                    setCurrentPost({...currentPost, subtitle: {...currentPost.subtitle, [currentLocale]: e.target.value}})
                                                }
                                            }} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2"><SparklesIcon className="w-3 h-3" /> Type of Post</label>
                                            <select className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-xl outline-none text-[11px] font-bold uppercase tracking-widest appearance-none" value={currentPost.category} onChange={(e) => setCurrentPost({...currentPost, category: e.target.value as any})}>
                                                <option value="news">News / Update</option>
                                                <option value="report">Scientific Report</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2"><CalendarDaysIcon className="w-3 h-3" /> Publish Date</label>
                                            <input type="date" className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-xl outline-none text-[11px] font-bold" value={currentPost.publishDate} onChange={(e) => setCurrentPost({...currentPost, publishDate: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2">Status</label>
                                            <select className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-xl outline-none text-[11px] font-bold uppercase tracking-widest appearance-none" value={currentPost.status} onChange={(e) => setCurrentPost({...currentPost, status: e.target.value as any})}>
                                                <option value="draft">Draft (Private)</option>
                                                <option value="published">Published (Live)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <textarea placeholder="Neural data entry..." className="w-full h-[600px] bg-transparent text-lg leading-relaxed outline-none border-none resize-none font-serif pt-6" 
                                        value={typeof currentPost.content === 'string' ? currentPost.content : currentPost.content[currentLocale]} 
                                        onChange={(e) => {
                                            if (typeof currentPost.content === 'string') {
                                                setCurrentPost({...currentPost, content: { pt: e.target.value, en: '', zh: '', es: '', fr: '' }})
                                            } else {
                                                setCurrentPost({...currentPost, content: {...currentPost.content, [currentLocale]: e.target.value}})
                                            }
                                        }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MÓDULO PLUGINS --- */}
                {activeTab === 'plugins' && (
                    <div className="flex-1 flex gap-8 overflow-hidden">
                        <div className={`w-[320px] rounded-[45px] flex flex-col overflow-hidden ${glassPanel}`}>
                            <div className="p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/20">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Modules</h2>
                                <button onClick={() => setCurrentPlugin({ id: '', name: '', author: 'Zaeon Core', description: '', category: 'Essencial', tag: '', price: 0, actionUrl: '', status: 'active', isLocked: false, unlockRequirement: '' })} className="p-2 bg-slate-900 dark:bg-cyan-500 text-white dark:text-black rounded-full hover:scale-110 shadow-lg transition-transform">
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {pluginList.map((p) => (
                                    <div key={p.id} onClick={() => setCurrentPlugin(p)} className={`p-5 rounded-3xl cursor-pointer transition-all border group relative ${currentPlugin.id === p.id ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/20' : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-white pr-6">{p.name}</h4>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{p.category} {p.isLocked && "🔒"}</p>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    handleDeletePlugin(p.id);
                                                }} 
                                                className="absolute right-4 top-4 p-1.5 text-slate-400 hover:bg-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`flex-1 rounded-[45px] flex flex-col relative overflow-hidden ${glassPanel}`}>
                            <div className="absolute top-8 right-8 z-20">
                                <button onClick={handleSavePlugin} className="px-8 py-3 rounded-2xl bg-slate-950 dark:bg-cyan-500 text-white dark:text-black font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                                    <RocketLaunchIcon className="w-5 h-5" /> Deploy Module
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-12 pt-24 custom-scrollbar">
                                <div className="max-w-2xl mx-auto space-y-10">
                                    <input type="text" placeholder="Module Identity..." className="w-full bg-transparent text-5xl font-black outline-none border-none placeholder:text-slate-200 dark:placeholder:text-white/10" value={currentPlugin.name} onChange={(e) => setCurrentPlugin({...currentPlugin, name: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-8">
                                        <select className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-2xl outline-none font-bold text-sm" value={currentPlugin.category} onChange={(e) => setCurrentPlugin({...currentPlugin, category: e.target.value as any})}><option value="Essencial">Essencial</option><option value="Agentes">Agentes</option><option value="Mentorias">Mentorias</option><option value="Blockchain">Blockchain</option></select>
                                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 p-4 rounded-2xl">
                                            <input type="checkbox" checked={currentPlugin.isLocked} onChange={(e) => setCurrentPlugin({...currentPlugin, isLocked: e.target.checked})} className="w-5 h-5 accent-cyan-500" />
                                            <span className="text-[10px] font-black uppercase text-slate-400">Lock Module</span>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {currentPlugin.isLocked && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-cyan-600">Unlock Requirement Message</label>
                                                <input type="text" placeholder="Ex: Nível 5 Necessário ou Badge Alpha" className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-2xl outline-none font-bold text-sm border border-cyan-500/30" value={currentPlugin.unlockRequirement} onChange={(e) => setCurrentPlugin({...currentPlugin, unlockRequirement: e.target.value})} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <textarea placeholder="Detailed description..." className="w-full h-40 bg-slate-100 dark:bg-white/5 p-6 rounded-[30px] outline-none text-sm leading-relaxed" value={currentPlugin.description} onChange={(e) => setCurrentPlugin({...currentPlugin, description: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// --- HELPER COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen }: any) => (
    <button onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${active ? 'bg-cyan-500 text-black shadow-lg scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
        <Icon className={`w-6 h-6 shrink-0 ${active ? 'stroke-[2.5px]' : 'stroke-1'}`} />
        {isOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black uppercase tracking-widest">{label}</motion.span>}
    </button>
);

const DetailBoard = ({ title, value, icon: Icon, isActive }: any) => (
    <div className={`p-7 rounded-[28px] border transition-all duration-300 ${isActive ? 'bg-cyan-500/10 border-cyan-400' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10'}`}>
        <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-500' : 'text-slate-400'}`} />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
        </div>
        <p className={`text-lg font-bold truncate ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-800 dark:text-white'}`}>{value}</p>
    </div>
);