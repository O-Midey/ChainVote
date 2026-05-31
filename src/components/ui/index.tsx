import { ReactNode } from "react";

export function Card({ children, className = "", hover = false, onClick }: {
  children: ReactNode; className?: string; hover?: boolean; onClick?: () => void;
}) {
  const base = `bg-[#16161d] border border-[#f0ede8]/[0.05] rounded-xl transition-all duration-200 ${className}`;
  const hoverStyles = hover || onClick ? "hover:border-[#f0ede8]/[0.12] hover:bg-[#1e1e26]" : "";

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} cursor-pointer text-left w-full ${hoverStyles}`}>
        {children}
      </button>
    );
  }
  return <div className={`${base} ${hoverStyles}`}>{children}</div>;
}

export function Badge({ children, variant = "default", dot = true }: {
  children: ReactNode; variant?: "default" | "green" | "red" | "amber"; dot?: boolean;
}) {
  const styles = {
    default: "bg-[#f0ede8]/[0.04] text-[#b0aca4] border-[#f0ede8]/[0.07]",
    green:   "bg-[#5a9e6f]/[0.08] text-[#6db580] border-[#5a9e6f]/[0.15]",
    red:     "bg-[#c85a54]/[0.08] text-[#d4706a] border-[#c85a54]/[0.15]",
    amber:   "bg-[#d4a853]/[0.08] text-[#d4a853] border-[#d4a853]/[0.15]",
  };
  const badgeDots = {
    default: "bg-[#b0aca4]", green: "bg-[#6db580]", red: "bg-[#d4706a]", amber: "bg-[#d4a853]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${styles[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${badgeDots[variant]}`} />}
      {children}
    </span>
  );
}

export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`border-2 border-[#f0ede8]/[0.06] border-t-[#d4a853] rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function Skeleton({ className = "", width, height }: {
  className?: string; width?: string | number; height?: string | number;
}) {
  return <div className={`skeleton ${className}`} style={{ width: width ?? "100%", height: height ?? 16 }} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-[#16161d] border border-[#f0ede8]/[0.05] rounded-xl p-5 space-y-3">
      <Skeleton height={20} width="65%" />
      <Skeleton height={14} width="85%" />
      <Skeleton height={5} width="100%" />
      <div className="flex justify-between pt-2">
        <Skeleton height={11} width={55} />
        <Skeleton height={11} width={70} />
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
      <div className="text-6xl opacity-10 mb-2 select-none">{icon}</div>
      <p className="text-[#f0ede8] font-semibold text-lg font-display">{title}</p>
      <p className="text-[#6e6b65] text-sm max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-[#f0ede8]/[0.04] ${className}`} />;
}

export function TrustBadge({ label, href, icon }: { label: string; href?: string; icon?: ReactNode }) {
  const content = (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6db580] bg-[#5a9e6f]/[0.05] border border-[#5a9e6f]/[0.12] px-2.5 py-1 rounded-full">
      {icon ?? <span className="w-1 h-1 rounded-full bg-[#6db580]" />}
      {label}
    </span>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}

export function ProgressBar({ value, color = "#d4a853", className = "" }: {
  value: number; color?: string; className?: string;
}) {
  return (
    <div className={`h-1 bg-[#f0ede8]/[0.04] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#16161d] border border-[#f0ede8]/[0.05] rounded-xl p-5 text-center">
      <p className="text-2xl font-bold text-[#f0ede8] tracking-tight font-display">{value}</p>
      <p className="text-[#6e6b65] text-[11px] mt-1 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}
