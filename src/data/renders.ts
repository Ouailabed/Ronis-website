import raw from "./renders.json";

type Render = { src: string; width: number; height: number };

// Prefix image paths with the build's base URL, so the site also works from a sub-folder
// or a relative-path build (e.g. the shareable preview).
const base = import.meta.env.BASE_URL;
const renders = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => [k, { ...v, src: base + v.src.replace(/^\//, "") }]),
) as { [K in keyof typeof raw]: Render };

export default renders;
