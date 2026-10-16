import Link from "next/link";
import {
  MdOutlineVideocam,
  MdArrowForward,
  MdFullscreen,
} from "react-icons/md";

export default function CamerasWidget() {
  return (
    <section className="rounded-2xl border border-[#DCE4D9] bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F0EB]">
            <MdOutlineVideocam className="text-2xl text-[#287969]" />
          </div>

          <div>
            <h2 className="font-semibold text-[var(--greenText)]">
              Kamera główna
            </h2>
            <p className="text-sm text-muted-foreground">Wejście do domu</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E2F0EB] px-2.5 py-1 text-xs font-medium text-[#287969]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#287969]" />
          Demo
        </span>
      </div>

      <div className="group relative overflow-hidden rounded-xl bg-[#263C35]">
        <video
          className="aspect-video w-full object-cover saturate-50 sepia-20"
          src="/videos/camera.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls
          aria-label="Demonstracyjny obraz z kamery głównej"
        />

        {/* Delikatny zielony overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b1513]/85 via-transparent to-[#111b19]/75"
          aria-hidden="true"
        />

        {/* Ciemniejsze przejście u dołu */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10201c]/85 via-transparent to-[#0f1715]/65"
          aria-hidden="true"
        />

        {/* Etykieta kamery */}
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/20 bg-[#19483D]/70 px-2.5 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
          KAMERA 01
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Nagranie demonstracyjne · nie jest to transmisja na żywo
        </p>

        <Link
          href="/cameras"
          aria-label="Otwórz stronę kamer"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#287969] hover:underline"
        >
          <MdFullscreen className="text-lg" />
          <span className="hidden sm:inline">Rozwiń</span>
          <MdArrowForward />
        </Link>
      </div>
    </section>
  );
}
