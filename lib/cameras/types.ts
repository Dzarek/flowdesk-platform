export type CameraStatus = "online" | "offline";

export type HomeCamera = {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  lastSeen: string;
};

export type CameraPreviewSource = {
  kind: "mock" | "stream";
  url?: string;
};
