import { useEffect, useState } from "react";
import {
  getCurrentUser,
  loginAnonymous,
  loginEmail,
  registerEmail,
  logoutUser,
  pushProgressToCloud,
  pullProgressFromCloud,
  getAppwriteConfig,
  saveAppwriteConfig,
} from "../services/appwrite";

interface Props {
  onClose: () => void;
}

export default function AppwriteModal({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"sync" | "auth" | "config">("sync");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Auth Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  // Config Inputs
  const [endpoint, setEndpoint] = useState("");
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    fetchUser();
    const conf = getAppwriteConfig();
    setEndpoint(conf.endpoint);
    setProjectId(conf.projectId);
  }, []);

  async function fetchUser() {
    const u = await getCurrentUser();
    setUser(u);
  }

  async function handleAnonymous() {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      await loginAnonymous();
      await fetchUser();
      setStatusMsg("已成功初始化 Appwrite 匿名会话！");
    } catch (e: any) {
      setErrorMsg(e.message || "匿名登录失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      if (isRegister) {
        await registerEmail(email, password, name || undefined);
        setStatusMsg("注册并登录成功！");
      } else {
        await loginEmail(email, password);
        setStatusMsg("登录成功！");
      }
      await fetchUser();
    } catch (err: any) {
      setErrorMsg(err.message || "身份验证失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setStatusMsg("会话已退出");
    } catch (e: any) {
      setErrorMsg(e.message || "退出失败");
    } finally {
      setLoading(false);
    }
  }

  async function handlePush() {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      await pushProgressToCloud();
      setStatusMsg("全量答题与打卡进度已成功推送至云端！");
    } catch (e: any) {
      setErrorMsg(e.message || "推送过程异常");
    } finally {
      setLoading(false);
    }
  }

  async function handlePull() {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      await pullProgressFromCloud();
      setStatusMsg("云端数据已成功拉取并融合至本地！");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      setErrorMsg(e.message || "拉取过程异常");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    saveAppwriteConfig(endpoint, projectId);
    setStatusMsg("配置已保存！正在重新连接...");
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
      <div className="card w-full max-w-md p-6 relative border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl flex flex-col gap-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white transition text-sm"
          type="button"
        >
          ✕
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Appwrite BaaS 云端集成</h3>
            <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">无缝同步星河 60 模块进阶进度与答题记录</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between border-y border-slate-200 dark:border-white/5 py-2 text-xs">
          <span className="text-slate-500 dark:text-white/40">当前状态:</span>
          {user ? (
            <span className="text-emerald-600 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {user.email ? user.email : `匿名用户 (${user.$id.slice(0, 8)}...)`}
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-300">未连接 / 离线模式</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-950/50 p-1 border border-slate-200 dark:border-white/5 text-xs">
          <button
            onClick={() => setActiveTab("sync")}
            className={`flex-1 py-1.5 rounded-md transition font-medium ${
              activeTab === "sync" ? "bg-brand-600 text-white shadow" : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            ☁️ 云端同步
          </button>
          <button
            onClick={() => setActiveTab("auth")}
            className={`flex-1 py-1.5 rounded-md transition font-medium ${
              activeTab === "auth" ? "bg-brand-600 text-white shadow" : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            👤 账户验证
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex-1 py-1.5 rounded-md transition font-medium ${
              activeTab === "config" ? "bg-brand-600 text-white shadow" : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            ⚙️ 配置端点
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{errorMsg}</div>}
        {statusMsg && <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">{statusMsg}</div>}

        {/* Tab 1: Sync */}
        {activeTab === "sync" && (
          <div className="space-y-3 py-1">
            <p className="text-xs text-slate-600 dark:text-white/50 leading-relaxed">
              将本地离线缓存的 60 个模块的刷题记录、收藏真题与练习成就同步至 Appwrite 云端数据库。
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handlePush}
                disabled={loading}
                className="btn-primary w-full text-xs font-semibold py-2.5"
                type="button"
              >
                {loading ? "同步中..." : "📤 推送本地数据至 Appwrite 云端"}
              </button>
              <button
                onClick={handlePull}
                disabled={loading}
                className="btn-ghost w-full text-xs font-semibold py-2.5"
                type="button"
              >
                {loading ? "拉取中..." : "📥 从 Appwrite 云端恢复全站数据"}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Auth */}
        {activeTab === "auth" && (
          <div className="space-y-3">
            {!user ? (
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {isRegister && (
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-white/40 mb-1 block">昵称</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="您的称呼"
                      className="input !text-xs py-1.5"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-white/40 mb-1 block">邮箱</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="input !text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-white/40 mb-1 block">密码</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="包含至少8位字符"
                    className="input !text-xs py-1.5"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={loading} className="btn-primary flex-1 text-xs font-semibold py-2">
                    {isRegister ? "注册并登录" : "登录 Appwrite"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="btn-ghost text-xs px-3 py-2"
                  >
                    {isRegister ? "切至登录" : "切至注册"}
                  </button>
                </div>
                <div className="border-t border-slate-200 dark:border-white/5 pt-2">
                  <button
                    type="button"
                    onClick={handleAnonymous}
                    disabled={loading}
                    className="btn-ghost w-full text-xs text-slate-600 dark:text-white/60 py-1.5"
                  >
                    👤 一键开启 Appwrite 匿名会话
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-center py-2">
                <p className="text-xs text-slate-600 dark:text-white/60">您已使用 Appwrite 完成认证。</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="btn-danger text-xs px-4 py-2"
                >
                  退出会话
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Config */}
        {activeTab === "config" && (
          <form onSubmit={handleSaveConfig} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 dark:text-white/40 mb-1 block">Appwrite Endpoint API URL</label>
              <input
                type="text"
                required
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://cloud.appwrite.io/v1"
                className="input !text-xs py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 dark:text-white/40 mb-1 block">Appwrite Project ID</label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="openskill-galaxy"
                className="input !text-xs py-1.5 font-mono"
              />
            </div>
            <button type="submit" className="btn-primary w-full text-xs font-semibold py-2">
              保存配置并重连
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
