import Image from "next/image";

const LogoNav = ({
  colors = ["#fff", "#fff", "#fff"],
}: {
  colors?: string[];
}) => {
  return (
    <div className="flex gap-1 items-center justify-center">
      <Image
        src="/logo2.png"
        alt="logo"
        width={100}
        height={100}
        className="object-contain w-20 h-20 min-[1600px]:w-16 min-[1600px]:h-16 animate-pulse animation-duration-[5s]"
      />
      <div className="flex flex-col  text-2xl  tracking-wider">
        <h1 className="font-[family-name:var(--font-quicksand)] text-3xl font-extrabold tracking-tight">
          <span className="text-[#eae3d0]">Life</span>
          <span className="text-[#819B72]">Hub</span>
        </h1>
      </div>
    </div>
  );
};

export default LogoNav;
