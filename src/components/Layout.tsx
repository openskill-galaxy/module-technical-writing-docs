import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import type { ModuleData } from "../data/loaders";
import { useSEO } from "../hooks/useSEO";

export default function Layout({
  data,
  children,
}: {
  data: ModuleData;
  children: ReactNode;
}) {
  const { pathname } = useLocation();

  // 全局兜底标题/描述（详情页会各自覆盖为「条目 · 模块名」）
  useSEO({ title: data.module.title, description: data.module.description });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-full flex flex-col bg-page">
      {/* Subtle ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 50% -8%, var(--accent-soft), transparent 70%)",
        }}
      />
      <Header module={data.module} data={data} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="container-page py-8 animate-fade-in">{children}</div>
        </main>
      </div>
      <Footer module={data.module} />
    </div>
  );
}
