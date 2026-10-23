"use client";

import { useEffect, type DependencyList } from "react";

// 화면에 들어온 요소에 visible 클래스를 붙여 등장 애니메이션을 켠다
export function useRevealOnScroll(
  selector: string,
  options: IntersectionObserverInit,
  deps: DependencyList,
) {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll(selector));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("visible", e.isIntersecting)),
      options,
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
