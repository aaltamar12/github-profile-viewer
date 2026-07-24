"use client";

import { useEffect } from "react";
import { Window } from "@/components/window";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-14 sm:py-24">
      <Window>
        <div className="p-10 sm:p-14 text-center">
          <p className="font-display text-[22px]">Algo se rompió</p>
          <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-ink-muted">
            Ocurrió un error inesperado renderizando esta página.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 text-[13px] text-signal underline-offset-4 hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </Window>
    </main>
  );
}
