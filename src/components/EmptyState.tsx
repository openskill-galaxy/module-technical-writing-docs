interface Props {
  emoji?: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ emoji = "📭", title, hint, action }: Props) {
  return (
    <div className="card p-10 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="mt-3 text-white font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-white/60">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
