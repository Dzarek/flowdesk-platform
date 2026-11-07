import Image from "next/image";

const Logo = ({ colors = ["#fff", "#fff", "#fff"] }: { colors?: string[] }) => {
  return (
    <div className="flex mx-auto gap-2 min-[1600px]:gap-4 min-[1600px]:mb-7 items-center justify-center">
      <Image
        src="/logo6.png"
        alt="logo"
        width={100}
        height={100}
        className="object-contain w-17 h-17 min-[1600px]:w-30 min-[1600px]:h-30"
      />
      <div className="flex flex-col tracking-wider">
        <h1 className="font-[family-name:var(--font-doppio-one)] text-3xl min-[1600px]:text-5xl  tracking-wider font-semibold">
          <span className="text-[#eae3d0]">Life</span>
          <span className="text-[#819B72]">Hub</span>
        </h1>
        <span
          className={`text-[#FFFEFA] mt-2 text-sm min-[1600px]:text-base tracking-normal uppercase hidden lg:inline`}
        >
          Domowe Centrum Operacji
        </span>
      </div>
    </div>
  );
};

export default Logo;
