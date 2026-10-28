import Image from "next/image";

const LogoNav = ({}: { colors?: string[] }) => {
  return (
    <div className="flex gap-1 items-center justify-center">
      <Image
        src="/logo6.png"
        alt="logo"
        width={100}
        height={100}
        className="object-contain w-16 h-16 min-[1600px]:w-20 min-[1600px]:h-20"
      />
      <div className="flex flex-col  text-2xl  tracking-wider">
        <h1 className="font-[family-name:var(--font-doppio-one)] text-[28px] tracking-wider font-semibold">
          <span className="text-[#eae3d0]">Life</span>
          <span className="text-[#819B72]">Hub</span>
        </h1>
      </div>
    </div>
  );
};

export default LogoNav;
