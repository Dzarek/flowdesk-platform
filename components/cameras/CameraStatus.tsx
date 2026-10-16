import type { CameraStatus as CameraStatusType } from "@/lib/cameras/types";
import { MdOutlineCircle } from "react-icons/md";

type Props = {
  status: CameraStatusType;
};

export default function CameraStatus({ status }: Props) {
  const online = status === "online";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        online ? "bg-[#E2F0EB] text-[#287969]" : "bg-[#F3E8E5] text-[#A45D4D]"
      }`}
    >
      <MdOutlineCircle className="text-[9px]" />
      {online ? "Online" : "Offline"}
    </span>
  );
}
