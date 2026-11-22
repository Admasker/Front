import { Layers2 } from "lucide-react";
export default function Brand({ compact = false }: { compact?: boolean }) {
  return <a className={`brand ${compact ? "brand-compact" : ""}`} href="/" aria-label="Admasker 홈"><span className="brand-symbol"><Layers2 size={22} strokeWidth={2.4} /></span><span>admasker<span className="brand-period">.</span></span></a>;
}
