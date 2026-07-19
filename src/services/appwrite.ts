import { Client, Account, Databases, ID, Query } from "appwrite";

const DEFAULT_ENDPOINT = "https://cloud.appwrite.io/v1";
const DEFAULT_PROJECT = "openskill-galaxy";
const DATABASE_ID = "openskill_db";
const COLLECTION_ID = "user_progress";

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
}

export function getAppwriteConfig(): AppwriteConfig {
  return {
    endpoint: localStorage.getItem("openskill_appwrite_endpoint") || (import.meta as any).env?.VITE_APPWRITE_ENDPOINT || DEFAULT_ENDPOINT,
    projectId: localStorage.getItem("openskill_appwrite_project_id") || (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || DEFAULT_PROJECT,
  };
}

export function saveAppwriteConfig(endpoint: string, projectId: string) {
  if (endpoint) localStorage.setItem("openskill_appwrite_endpoint", endpoint);
  else localStorage.removeItem("openskill_appwrite_endpoint");

  if (projectId) localStorage.setItem("openskill_appwrite_project_id", projectId);
  else localStorage.removeItem("openskill_appwrite_project_id");
}

let clientInstance: Client | null = null;
let accountInstance: Account | null = null;
let databasesInstance: Databases | null = null;

export function getAppwriteInstances() {
  const { endpoint, projectId } = getAppwriteConfig();
  if (!clientInstance) {
    clientInstance = new Client();
  }
  clientInstance.setEndpoint(endpoint).setProject(projectId);

  if (!accountInstance) accountInstance = new Account(clientInstance);
  if (!databasesInstance) databasesInstance = new Databases(clientInstance);

  return { client: clientInstance, account: accountInstance, databases: databasesInstance };
}

export async function getCurrentUser() {
  try {
    const { account } = getAppwriteInstances();
    return await account.get();
  } catch (e) {
    return null;
  }
}

export async function loginAnonymous() {
  const { account } = getAppwriteInstances();
  return await account.createAnonymousSession();
}

export async function loginEmail(email: string, pass: string) {
  const { account } = getAppwriteInstances();
  return await account.createEmailPasswordSession(email, pass);
}

export async function registerEmail(email: string, pass: string, name?: string) {
  const { account } = getAppwriteInstances();
  await account.create(ID.unique(), email, pass, name || "Learner");
  return await loginEmail(email, pass);
}

export async function logoutUser() {
  const { account } = getAppwriteInstances();
  try {
    await account.deleteSession("current");
  } catch (e) {}
}

export async function pushProgressToCloud() {
  const user = await getCurrentUser();
  if (!user) throw new Error("请先登录或初始化 Appwrite 访客身份");

  const { databases } = getAppwriteInstances();
  const backupData: Record<string, string> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("openskill-") || key === "theme")) {
      const val = localStorage.getItem(key);
      if (val) backupData[key] = val;
    }
  }

  const payload = {
    userId: user.$id,
    data: JSON.stringify(backupData),
    updatedAt: new Date().toISOString(),
  };

  try {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("userId", user.$id),
    ]);

    if (existing.documents.length > 0) {
      const docId = existing.documents[0].$id;
      return await databases.updateDocument(DATABASE_ID, COLLECTION_ID, docId, payload);
    } else {
      return await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), payload);
    }
  } catch (err: any) {
    // Fallback: If Appwrite collection doesn't exist on self-hosted instance, save formatted JSON to user preferences
    const { account } = getAppwriteInstances();
    await account.updatePrefs({ openskill_progress: JSON.stringify(backupData), updatedAt: new Date().toISOString() });
    return { status: "saved_to_user_prefs" };
  }
}

export async function pullProgressFromCloud() {
  const user = await getCurrentUser();
  if (!user) throw new Error("请先登录或初始化 Appwrite 访客身份");

  const { databases, account } = getAppwriteInstances();
  let progressJsonStr = "";

  try {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("userId", user.$id),
    ]);

    if (existing.documents.length > 0) {
      progressJsonStr = existing.documents[0].data;
    }
  } catch (err) {
    // Fallback to user preferences
    const prefs = await account.getPrefs();
    if (prefs?.openskill_progress) {
      progressJsonStr = prefs.openskill_progress;
    }
  }

  if (!progressJsonStr) {
    throw new Error("云端未查找到存盘进度");
  }

  const backupData = JSON.parse(progressJsonStr);
  Object.entries(backupData).forEach(([k, v]) => {
    if (k.startsWith("openskill-") || k === "theme") {
      localStorage.setItem(k, v as string);
    }
  });

  return backupData;
}
