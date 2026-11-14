"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, CloudOff, CloudUpload, RefreshCw, Smartphone } from "lucide-react";
import { offline } from "@/content/id";

const icons = {
  smartphone: Smartphone,
  "cloud-off": CloudOff,
  "refresh-cw": RefreshCw,
  "cloud-check": CloudUpload,
  "circle-alert": CircleAlert,
} as const;

export function OfflineDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const frame = requestAnimationFrame(() => setLit(99));
      return () => cancelAnimationFrame(frame);
    }

    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        let count = 0;
        timer = setInterval(() => {
          count += 1;
          setLit(count);
          if (count >= 5 && timer) clearInterval(timer);
        }, 300);
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="flow" ref={ref} role="group" aria-label="Alur status sinkronisasi offline">
      <div className="flow__row">
        {offline.nodes.map((node, index) => {
          const Icon = icons[node.icon as keyof typeof icons];
          return (
            <div key={node.label} className={index < lit ? "flow__node is-on" : "flow__node"}>
              <span className="flow__dot" aria-hidden="true">
                <Icon size={20} strokeWidth={1.7} />
              </span>
              <span className="flow__label">{node.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flow__branch">
        <span className="flow__branch-line" aria-hidden="true" />
        <div className={lit >= 5 ? "flow__node flow__node--warn is-on" : "flow__node flow__node--warn"}>
          <span className="flow__dot" aria-hidden="true">
            <CircleAlert size={20} strokeWidth={1.7} />
          </span>
          <span className="flow__label">{offline.branch.label}</span>
        </div>
      </div>
    </div>
  );
}
