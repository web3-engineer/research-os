export default function ProjetosModule() {
    return (
        <div className="p-8 rounded-3xl bg-[#0f172a]/5 dark:bg-blue-500/5 border border-[#0f172a]/10">
            <h4 className="text-[#0f172a] dark:text-white font-bold mb-4">Projetos Ativos</h4>
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] dark:text-slate-400">
                    <span>Zaeon Core Expansion</span>
                    <span className="text-[#0f172a] dark:text-blue-400">88%</span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[88%] h-full bg-[#0f172a] dark:bg-blue-500" />
                </div>
            </div>
        </div>
    );
}