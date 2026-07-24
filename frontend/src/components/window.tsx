export function Window({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[640px] animate-rise">
      <div className="rounded-lg border border-hairline bg-paper-raised/40 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
