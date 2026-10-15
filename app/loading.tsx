export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden items-center justify-center">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 -z-10 h-full w-full object-cover opacity-25"
      >
        <source src="/videos/videoBg4.webm" type="video/webm" />
      </video>
      <div className="flex flex-col items-center">
        <div className="relative size-14 xl:size-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#0f361d]" />
        </div>

        <p className="mt-6 text-base xl:text-xl font-medium text-zinc-700">
          Ładowanie LifeHub...
        </p>
      </div>
    </div>
  );
}
