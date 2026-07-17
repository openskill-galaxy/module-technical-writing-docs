import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside OpenSkill Module:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#05060b] text-white">
          <div className="starfield fixed inset-0 -z-10 opacity-50" />
          <div className="cosmic-glow" />
          <div className="card max-w-md p-8 space-y-5">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-xl font-bold tracking-wide text-white">模块加载失败</h2>
            <p className="text-xs text-white/50 leading-relaxed">
              当前学习模块的课程库或题库数据无法正确读取或解析。建议清空本地数据或者刷新页面重试。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary flex-1 text-xs font-bold"
              >
                刷新重试
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="btn-ghost flex-1 text-xs font-bold"
              >
                重置本地状态
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
