export default function NoticiasModule() {
    return (
        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#0f172a] dark:text-white/60">Global Updates</h3>
            {[1, 2].map((i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/40 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-3">
                    <div className="w-20 h-2 bg-[#0f172a] dark:bg-blue-900/40 rounded shadow-sm" />
                    <div className="w-full h-4 bg-slate-200 dark:bg-white/5 rounded" />
                    <div className="w-2/3 h-4 bg-slate-200 dark:bg-white/5 rounded" />
                </div>
            ))}
        </div>
    );
}