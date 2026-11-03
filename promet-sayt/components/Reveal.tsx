"use client";
import { useEffect, useRef } from "react";

/** Element ko'rinishga kirganda ochiladi: "img" — pardani ko'tarish, "up" — yuqoriga suzib chiqish */
export default function Reveal({
  kind = "up",
  as: Tag = "div",
  className,
  style,
  children,
  delay = 0,
}: {
  kind?: "img" | "up";
  as?: "div" | "section" | "li" | "figure";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return el.classList.add("in");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );
    // clip-path bilan yopilgan element brauzerda "ko'rinmas" hisoblanadi — shuning uchun ota elementni kuzatamiz
    io.observe(kind === "img" && el.parentElement ? el.parentElement : el);
    return () => io.disconnect();
  }, [kind]);
  return (
    <Tag
      ref={ref as never}
      data-reveal={kind}
      className={className}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
