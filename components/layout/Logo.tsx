import Image from "next/image";

const Logo = ({ colors = ["#fff", "#fff", "#fff"] }: { colors?: string[] }) => {
  return (
    <div className="flex mx-auto gap-1 items-center justify-center">
      <Image
        src="/logo.png"
        alt="logo"
        width={100}
        height={100}
        className="object-contain w-17 h-17"
      />
      <div className="flex flex-col  text-3xl  tracking-wider">
        <h1 className={`text-[${colors[0]}] font-extrabold font-serif`}>
          Life<span className={`text-[${colors[1]}]`}>Hub</span>
        </h1>
        <span
          className={`text-[${colors[2]}] text-[11px] tracking-normal uppercase`}
        >
          Domowe Centrum Operacji
        </span>
      </div>
    </div>
  );
};

export default Logo;
