import type { ModuleMeta } from "../types";

export default function Footer({ module }: { module: ModuleMeta }) {
  const versionStr = module?.version ? `v${module.version}` : "v1.0.0";
  const updatedStr = module?.updatedAt ? `更新于 ${module.updatedAt}` : `更新于 ${new Date().toISOString().slice(0, 10)}`;
  const licenseStr = module?.license || "MIT License";

  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/40">
      <div className="container-page py-6 text-sm text-slate-600 dark:text-white/60">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>
            <p className="text-slate-900 dark:text-white/80 font-bold">{module?.title || "OpenSkill Galaxy 模块"}</p>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
              {versionStr} · {updatedStr} · {licenseStr}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            {module?.repoUrl && (
              <a className="text-brand-600 dark:text-brand-300 hover:underline" href={module.repoUrl} target="_blank" rel="noreferrer">
                📂 模块 GitHub 仓库
              </a>
            )}
            {module?.portalUrl && (
              <a className="text-brand-600 dark:text-brand-300 hover:underline" href={module.portalUrl} target="_blank" rel="noreferrer">
                🌐 返回 OpenSkill 总站
              </a>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400 dark:text-white/40">
          © {new Date().getFullYear()} OpenSkill Galaxy · 开放技能星河架构体系
        </p>
      </div>
    </footer>
  );
}
