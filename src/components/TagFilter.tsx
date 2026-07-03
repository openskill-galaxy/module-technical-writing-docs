import type { Tag } from "../types";

interface Props {
  tags: Tag[];
  selected: string[]; // tag ids
  onChange: (next: string[]) => void;
}

export default function TagFilter({ tags, selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
    } else {
      onChange([...selected, id]);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange([])}
        className={`rounded-full px-3 py-1.5 text-sm transition ${
          selected.length === 0
            ? "bg-brand-600 text-white"
            : "border border-white/10 text-white/70 hover:bg-white/5"
        }`}
      >
        全部
      </button>
      {tags.map((t) => {
        const active = selected.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              active
                ? "bg-brand-600 text-white"
                : "border border-white/10 text-white/70 hover:bg-white/5"
            }`}
            title={t.description}
          >
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
