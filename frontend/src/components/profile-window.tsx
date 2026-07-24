type HeaderStatus = "pending" | "ok" | "error";

export function TerminalHeader({
  username,
  status,
  code,
}: {
  username: string;
  status: HeaderStatus;
  code?: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-hairline px-5 py-3 text-[13px]">
      <span className="text-ink-muted truncate">
        <span className="text-ink-faint">GET</span>{" "}
        <span>/user/{username}</span>
        {status === "pending" && (
          <span
            className="cursor-blink ml-1 inline-block w-[7px] bg-ink-faint align-middle"
            style={{ height: "1em" }}
            aria-hidden
          />
        )}
      </span>
      {status === "ok" && (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-signal">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          200 OK
        </span>
      )}
      {status === "error" && (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-danger">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          {code ?? "ERR"}
        </span>
      )}
    </div>
  );
}

export function Window({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[640px] animate-rise">
      <div className="rounded-lg border border-hairline bg-paper-raised/40 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

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
