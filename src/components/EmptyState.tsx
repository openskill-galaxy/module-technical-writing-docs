interface Props {
  emoji?: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ emoji = "📭", title, hint, action }: Props) {
  return (
    <div className="card p-10 text-center border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-950/40">
      <div className="text-4xl filter drop-shadow-sm">{emoji}</div>
      <p className="mt-3 text-slate-900 dark:text-white font-bold text-base">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-600 dark:text-white/60 max-w-md mx-auto leading-relaxed">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
