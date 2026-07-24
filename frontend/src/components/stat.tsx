export function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-display text-[26px] leading-none tabular-nums">
        {value.toLocaleString("es")}
      </div>
      <div className="mt-2 text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </div>
    </div>
  );
}
