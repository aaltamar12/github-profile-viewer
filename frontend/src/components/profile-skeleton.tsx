import { TerminalHeader, Window } from "@/components/profile-window";

export function ProfileSkeleton({ username }: { username: string }) {
  return (
    <Window>
      <TerminalHeader username={username} status="pending" />
      <div className="p-6 sm:p-10">
        <div className="flex items-start gap-5">
          <div className="skeleton h-16 w-16 sm:h-24 sm:w-24 shrink-0 rounded-[10px]" />
          <div className="min-w-0 flex-1 pt-1">
            <div className="skeleton h-7 sm:h-8 w-3/5 rounded" />
            <div className="skeleton mt-3 h-4 w-1/4 rounded" />
          </div>
        </div>

        <div className="skeleton mt-7 h-4 w-4/5 rounded" />

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-hairline pt-6">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="skeleton h-7 w-10 rounded" />
              <div className="skeleton mt-2.5 h-2.5 w-16 rounded" />
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-hairline pt-5">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-3.5 w-20 rounded" />
        </div>
      </div>
    </Window>
  );
}
