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
