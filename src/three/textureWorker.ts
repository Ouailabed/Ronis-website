import * as D from "./textureData";
import type { MapData } from "./textureData";

type Kind = "crust" | "crumb" | "cream" | "salmon";

/** Builds texture data in a Web Worker when possible, falling back to the main thread. */
export function makeTextureData(jobs: { kind: Kind; size: number; seed: number }[]): Promise<MapData[]> {
  const inline = () =>
    jobs.map((j) =>
      j.kind === "crust" ? D.crustMaps(j.size, j.seed, "golden") : j.kind === "crumb" ? D.crumbMaps(j.size, j.seed) : j.kind === "cream" ? D.creamMaps(j.size, j.seed) : D.salmonMaps(j.size, j.seed),
    );
  if (typeof Worker === "undefined") return Promise.resolve(inline());
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./textures.worker.ts", import.meta.url), { type: "module" });
    } catch {
      resolve(inline());
      return;
    }
    const results: MapData[] = new Array(jobs.length);
    let done = 0;
    worker.onmessage = (e: MessageEvent<{ id: number; data: MapData }>) => {
      results[e.data.id] = e.data.data;
      done += 1;
      if (done === jobs.length) {
        worker.terminate();
        resolve(results);
      }
    };
    worker.onerror = () => {
      worker.terminate();
      resolve(inline());
    };
    jobs.forEach((j, id) => worker.postMessage({ id, ...j }));
  });
}
