import type { ModuleMeta } from "../types";

export default function Footer({ module }: { module: ModuleMeta }) {
  return (
    <footer className="border-t border-white/10 bg-ink-900/40">
      <div className="container-page py-6 text-sm text-white/60">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>
            <p className="text-white/80 font-medium">{module.title}</p>
            <p className="text-xs">
              v{module.version} · 更新于 {module.updatedAt} · {module.license}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {module.repoUrl && (
              <a className="hover:text-white" href={module.repoUrl} target="_blank" rel="noreferrer">
                模块仓库
              </a>
            )}
            {module.portalUrl && (
              <a className="hover:text-white" href={module.portalUrl} target="_blank" rel="noreferrer">
                返回总入口站
              </a>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-white/40">
          © {new Date().getFullYear()} OpenSkill Galaxy · Module Template
        </p>
      </div>
    </footer>
  );
}
