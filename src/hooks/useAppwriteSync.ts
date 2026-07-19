import { useEffect, useState } from "react";
import { getCurrentUser, pushProgressToCloud, pullProgressFromCloud } from "../services/appwrite";

export function useAppwriteSync() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const sessionUser = await getCurrentUser();
        setUser(sessionUser);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const pushSync = async () => {
    setSyncing(true);
    setMsg("");
    try {
      await pushProgressToCloud();
      setMsg("✓ 进度已成功云端同步");
      setTimeout(() => setMsg(""), 2500);
      return { success: true };
    } catch (err: any) {
      setMsg(`❌ 同步失败: ${err.message || err}`);
      return { success: false, error: err.message };
    } finally {
      setSyncing(false);
    }
  };

  const pullSync = async () => {
    setSyncing(true);
    setMsg("");
    try {
      await pullProgressFromCloud();
      setMsg("✓ 进度已成功云端拉取");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return { success: true };
    } catch (err: any) {
      setMsg(`❌ 拉取失败: ${err.message || err}`);
      return { success: false, error: err.message };
    } finally {
      setSyncing(false);
    }
  };

  return { user, setUser, loading, syncing, msg, pushSync, pullSync };
}
