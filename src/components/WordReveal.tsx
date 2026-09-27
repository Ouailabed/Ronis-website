import { useEffect, useRef } from "react";
import { gsap, reducedMotion, ScrollTrigger } from "../lib/motion";

/**
 * Large statement text whose words light up one by one as you scroll through it.
 * The full sentence is always in the DOM and readable; only the colour animates.
 */
export default function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const words = el.querySelectorAll(".wr-word");
    const tween = gsap.fromTo(
      words,
      { opacity: 0.16 },
      { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);
  useEffect(() => () => ScrollTrigger.refresh(), []);
  return (
    <p ref={ref} className={`word-reveal ${className}`}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="wr-word">
          {w}{" "}
        </span>
      ))}
    </p>
  );
}
