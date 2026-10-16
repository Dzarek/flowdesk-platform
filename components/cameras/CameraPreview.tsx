import { MdOutlineVideocam, MdOutlineVideocamOff } from "react-icons/md";
import type { CameraStatus } from "@/lib/cameras/types";

type Props = {
  name: string;
  status: CameraStatus;
  large?: boolean;
};

export default function CameraPreview({ name, status, large = false }: Props) {
  const online = status === "online";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-[#DCE4D9] ${
        large ? "aspect-video" : "aspect-[4/3]"
      } ${
        online
          ? "bg-gradient-to-br from-[#DCE9DD] via-[#EDF1E7] to-[#C6D9C6]"
          : "bg-[#E8EAE5]"
      }`}
    >
      <div className="absolute inset-0 opacity-40">
        <div className="absolute bottom-0 h-1/3 w-full bg-[#B7CBB7]" />
        <div className="absolute bottom-[25%] left-[15%] h-[40%] w-[24%] rounded-t-lg border-4 border-[#FEFEFA] bg-[#D6E3D4]" />
        <div className="absolute bottom-[25%] right-[15%] h-[55%] w-[30%] rounded-t-lg border-4 border-[#FEFEFA] bg-[#C4D8C5]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        {online ? (
          <MdOutlineVideocam className="text-4xl text-[#287969]" />
        ) : (
          <MdOutlineVideocamOff className="text-4xl text-[#839087]" />
        )}

        <span className="rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-[#263C35]">
          {online ? "Podgląd demonstracyjny" : "Brak połączenia"}
        </span>
      </div>

      <div className="absolute left-3 top-3 rounded-md bg-[#263C35]/75 px-2 py-1 text-xs text-white">
        {name}
      </div>

      {online && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-[#263C35]/75 px-2 py-1 text-xs text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[#A4D78F]" />
          DEMO
        </div>
      )}
    </div>
  );
}
