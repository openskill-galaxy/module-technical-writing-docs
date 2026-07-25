import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  jsonLd?: Record<string, any>;
}

export function useSEO({ title, description, jsonLd }: SEOProps) {
  useEffect(() => {
    // 1. Dynamic Title Update
    const prevTitle = document.title;
    document.title = title ? `${title} | OpenSkill Galaxy` : "OpenSkill Galaxy Module";

    // 2. Dynamic Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.getAttribute("content") || "";
    if (description) {
      metaDesc.setAttribute("content", description);
    }

    // 3. Dynamic JSON-LD Structured Data
    let scriptTag: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptTag = document.createElement("script");
      scriptTag.type = "application/ld+json";
      scriptTag.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    return () => {
      document.title = prevTitle;
      if (prevDesc) metaDesc?.setAttribute("content", prevDesc);
      if (scriptTag && document.head.contains(scriptTag)) {
        document.head.removeChild(scriptTag);
      }
    };
  }, [title, description, jsonLd]);
}
