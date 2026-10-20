import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden items-center justify-center">
      <div className="flex flex-col items-center">
        <Image
          src="/logo2.png"
          alt="logo"
          width={100}
          height={100}
          className="object-contain w-30 h-30 min-[1600px]:w-30 min-[1600px]:h-30 animate-pulse animation-duration-[5s]"
        />

        <p className="mt-6 text-base xl:text-xl font-medium text-zinc-700">
          Ładowanie LifeHub...
        </p>
      </div>
    </div>
  );
}
