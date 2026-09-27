import { useState } from "react";

/** Copy the shop's address, or share the shop page (native share sheet on phones, copy link elsewhere). */
export default function CopyShare({ address, title }: { address: string; title: string }) {
  const [note, setNote] = useState("");
  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(""), 2200);
  };
  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(msg);
    } catch {
      // older browsers / no clipboard permission: fall back to a hidden text field
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      flash(ok ? msg : "Couldn't copy — select the text instead");
    }
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return; // the visitor closed the share sheet
      }
    }
    copy(url, "Link copied");
  };
  return (
    <div className="copy-share">
      <button className="btn btn-line btn-sm" onClick={() => copy(address, "Address copied")}>
        Copy address
      </button>
      <button className="btn btn-line btn-sm" onClick={share}>
        Share this shop
      </button>
      <span className="copy-note" role="status">
        {note}
      </span>
    </div>
  );
}
