import Image from "next/image";

const LogoNav = ({
  colors = ["#fff", "#fff", "#fff"],
}: {
  colors?: string[];
}) => {
  return (
    <div className="flex gap-4 items-center justify-center mx-auto">
      <Image
        src="/logo.png"
        alt="logo"
        width={100}
        height={100}
        className="object-contain w-12 h-12 min-[1600px]:w-16 min-[1600px]:h-16 animate-pulse"
      />
      <div className="flex flex-col  text-xl  tracking-wider">
        <h1 className={`text-[${colors[0]}] font-extrabold font-serif`}>
          Life<span className={`text-[${colors[1]}]`}>Hub</span>
        </h1>
      </div>
    </div>
  );
};

export default LogoNav;
