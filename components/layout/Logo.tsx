import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex mx-auto items-center justify-center pr-3">
      <Image
        src="/logo.png"
        alt="logo"
        width={100}
        height={100}
        className="object-contain w-20 h-20"
      />
      <div className="flex flex-col font-black text-2xl tracking-tight">
        <h1 className="text-white">FlowDesk</h1>
        <span className="text-green-200 text-sm tracking-widest">HOTEL</span>
      </div>
    </div>
  );
};

export default Logo;
