"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

export default function ArticlePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");
    
    const [article, setArticle] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        
        const fetchArticle = async () => {
            try {
                // Aqui você pode criar um endpoint /api/news/[id] ou filtrar no front
                const res = await fetch('/api/news');
                const data = await res.json();
                const found = data.find((post: any) => post.id === id);
                setArticle(found);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchArticle();
    }, [id]);

    if (isLoading) return <div className="h-screen flex items-center justify-center dark:text-white text-slate-800 tracking-widest uppercase text-xs">Decrypting Data...</div>;
    if (!article) return <div className="text-center mt-20 text-red-500">Article not found.</div>;

    const dateFormatted = new Date(article.publishDate).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030014] pb-20 transition-colors duration-500">
            {/* Header / Imagem de Capa */}
            <div className="relative w-full h-[50vh] min-h-[400px]">
                <img src={article.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#030014] via-black/40 to-black/60" />
                
                <button 
                    onClick={() => router.back()}
                    className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Lounge
                </button>
            </div>

            {/* Conteúdo do Artigo */}
            <div className="max-w-3xl mx-auto px-6 -mt-32 relative z-10">
                <div className="bg-white dark:bg-[#0a0a14]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-10 md:p-14 rounded-[40px] shadow-2xl">
                    <div className="flex items-center gap-2 text-cyan-500 mb-6 text-xs font-black uppercase tracking-widest">
                        <CalendarDaysIcon className="w-4 h-4" /> {dateFormatted}
                        <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
                        Special Report
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6 tracking-tighter">
                        {article.title}
                    </h1>
                    
                    <h2 className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium mb-12 leading-relaxed">
                        {article.subtitle}
                    </h2>
                    
                    <div className="w-full h-px bg-slate-200 dark:bg-white/10 mb-12" />
                    
                    {/* Renderização do texto. Para renderizar quebras de linha corretamente, usamos whitespace-pre-wrap */}
                    <div className="prose prose-slate dark:prose-invert max-w-none text-lg leading-loose font-serif text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {article.content}
                    </div>
                </div>
            </div>
        </div>
    );
}