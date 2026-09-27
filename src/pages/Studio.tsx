import { useEffect, useRef, useState } from "react";
import type { Shot } from "../three/studio";

/** Development-only page: /studio?shot=hero&w=1600&h=1200 */
export default function Studio() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const shot = (params.get("shot") ?? "hero") as Shot;
  const w = Number(params.get("w") ?? 1600), h = Number(params.get("h") ?? 1200);
  const progress = Number(params.get("p") ?? 0);
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = params.get("bg") ?? "transparent";
    import("../three/studio").then(({ renderShot }) => {
      if (!ref.current) return;
      const t0 = performance.now();
      renderShot(ref.current, shot, w, h, progress, params.get("clear") ?? undefined);
      console.log(`rendered ${shot} in ${Math.round(performance.now() - t0)}ms`);
      setDone(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} id="studio" data-done={done} style={{ width: w, height: h, display: "block" }} />;
}
