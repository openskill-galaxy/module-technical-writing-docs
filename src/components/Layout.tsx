import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import type { ModuleData } from "../data/loaders";

export default function Layout({
  data,
  children,
}: {
  data: ModuleData;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <Header module={data.module} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="container-page py-8">{children}</div>
        </main>
      </div>
      <Footer module={data.module} />
    </div>
  );
}
