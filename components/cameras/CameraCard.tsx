import type { HomeCamera } from "@/lib/cameras/types";
import CameraPreview from "./CameraPreview";
import CameraStatus from "./CameraStatus";

type Props = {
  camera: HomeCamera;
};

export default function CameraCard({ camera }: Props) {
  return (
    <article className="rounded-2xl border border-[#DCE4D9] bg-card p-3 transition-colors hover:border-[#B8CCB9] sm:p-4">
      <CameraPreview name={camera.name} status={camera.status} />

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-[var(--greenText)]">
            {camera.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {camera.location}
          </p>
        </div>

        <CameraStatus status={camera.status} />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {camera.status === "online"
          ? "Symulowany status połączenia"
          : `Ostatnio widziana: ${camera.lastSeen}`}
      </p>
    </article>
  );
}
