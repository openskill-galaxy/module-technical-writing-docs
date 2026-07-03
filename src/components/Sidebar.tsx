import { NavLink } from "react-router-dom";

const groups: { title: string; items: { to: string; label: string; end?: boolean }[] }[] = [
  {
    title: "学习",
    items: [
      { to: "/", label: "首页", end: true },
      { to: "/courses", label: "课程列表" },
      { to: "/knowledge", label: "知识点库" },
      { to: "/routes", label: "学习路线", end: true },
      { to: "/cases", label: "案例训练" },
    ],
  },
  {
    title: "练习",
    items: [
      { to: "/questions", label: "题库练习" },
      { to: "/exams", label: "模拟考试" },
      { to: "/wrong", label: "错题本" },
      { to: "/favorites", label: "收藏夹" },
    ],
  },
  {
    title: "其它",
    items: [
      { to: "/search", label: "搜索", end: true },
      { to: "/faq", label: "FAQ", end: true },
      { to: "/about", label: "关于本模块", end: true },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-56 shrink-0 border-r border-white/10 bg-ink-900/40">
      <nav className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-3 space-y-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 mb-1 text-xs uppercase tracking-wide text-white/40">
              {g.title}
            </p>
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
              >
                {it.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
