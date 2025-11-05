// app/error/db/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function DbErrorPage() {
  const params = useSearchParams();
  const message = params.get("msg");
  const status = params.get("status");

  return (
    <main className="min-w-screen min-h-screen flex bg-card flex-1 justify-center items-center font-rubik-400">
      <div className="flex flex-col items-center scale-90 sm:scale-125 transition-all duration-300 md:scale-150">
        <h3 className="text-lg text-foreground">Opps! Database Error</h3>
        <h1 className="text-9xl font-rubik-800 text-primary p-0 m-0">{status}</h1>
        {message && (
          <h3 className="text-lg text-destructive">{message}</h3>
        )}
      </div>
    </main>
  );
}
