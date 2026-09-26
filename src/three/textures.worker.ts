/// <reference lib="webworker" />
import * as D from "./textureData";

// Generates texture pixels off the main thread so the page stays responsive.
type Req = { id: number; kind: "crust" | "crumb" | "cream" | "salmon"; size: number; seed: number };

self.onmessage = (e: MessageEvent<Req>) => {
  const { id, kind, size, seed } = e.data;
  const data =
    kind === "crust" ? D.crustMaps(size, seed, "golden") : kind === "crumb" ? D.crumbMaps(size, seed) : kind === "cream" ? D.creamMaps(size, seed) : D.salmonMaps(size, seed);
  (self as unknown as Worker).postMessage({ id, data }, [data.color.buffer, data.normal.buffer, data.rough.buffer]);
};
