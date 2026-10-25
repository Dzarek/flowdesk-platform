"use client";

import { useState } from "react";
import {
  MdAdd,
  MdCameraAlt,
  MdCheckCircle,
  MdClose,
  MdErrorOutline,
  MdHistory,
  MdLock,
  MdLockOpen,
  MdOutlineBatteryAlert,
  MdOutlineDoorFront,
  MdOutlineLocalFireDepartment,
  MdOutlineSensors,
  MdOutlineShield,
  MdOutlineWaterDrop,
  MdRefresh,
  MdSettings,
  MdShield,
  MdThermostat,
  MdWarning,
  MdWifiOff,
} from "react-icons/md";

import {
  mockAlarm,
  mockCameras,
  mockSecurityEvents,
  mockSensors,
} from "@/lib/security/mock-data";

import type {
  SecurityCamera,
  SecurityDeviceStatus,
  SecurityEvent,
  SecuritySensor,
  SecuritySensorType,
} from "@/lib/security/types";
import Image from "next/image";

const statusConfig: Record<
  SecurityDeviceStatus,
  { label: string; className: string }
> = {
  ONLINE: {
    label: "Połączony",
    className: "bg-[#E2F0EB] text-[#287969]",
  },
  OFFLINE: {
    label: "Brak połączenia",
    className: "bg-[#FBE9E5] text-[#B34D3D]",
  },
  WARNING: {
    label: "Wymaga uwagi",
    className: "bg-[#FFF0D6] text-[#96661B]",
  },
};

const sensorConfig: Record<
  SecuritySensorType,
  { label: string; icon: typeof MdOutlineSensors }
> = {
  GAS: { label: "Gaz", icon: MdOutlineSensors },
  WATER: { label: "Zalanie", icon: MdOutlineWaterDrop },
  SMOKE: { label: "Dym", icon: MdOutlineLocalFireDepartment },
  CO: { label: "Tlenek węgla", icon: MdThermostat },
  MOTION: { label: "Ruch", icon: MdOutlineShield },
  DOOR: { label: "Otwarcie drzwi", icon: MdOutlineDoorFront },
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function SecurityPageContent() {
  const [cameras, setCameras] = useState(mockCameras);
  const [sensors, setSensors] = useState(mockSensors);
  const [events, setEvents] = useState(mockSecurityEvents);
  const [selectedCamera, setSelectedCamera] = useState<SecurityCamera | null>(
    null,
  );
  const [selectedSensor, setSelectedSensor] = useState<SecuritySensor | null>(
    null,
  );
  const [showAllEvents, setShowAllEvents] = useState(false);

  const onlineCameras = cameras.filter(
    (camera) => camera.status === "ONLINE",
  ).length;

  const onlineSensors = sensors.filter(
    (sensor) => sensor.status === "ONLINE",
  ).length;

  const offlineDevices = [
    ...cameras.filter((camera) => camera.status !== "ONLINE"),
    ...sensors.filter((sensor) => sensor.status !== "ONLINE"),
  ];

  const unacknowledgedEvents = events.filter((event) => !event.acknowledged);

  const visibleEvents = showAllEvents ? events : events.slice(0, 3);

  function acknowledgeEvent(eventId: string) {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId ? { ...event, acknowledged: true } : event,
      ),
    );
  }

  function handleAddDevice() {
    window.alert(
      "Dodawanie urządzeń będzie dostępne po przygotowaniu konfiguracji integracji.",
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Nagłówek */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#E2F0EB]" />

        <div className="relative flex h-[230px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#287969]">
              <MdOutlineShield size={21} />
              <span>Inteligentny dom</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#19483D] sm:text-5xl">
              Bezpieczeństwo
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#718078]">
              Kamery, czujniki i system alarmowy w jednym miejscu. Sprawdzaj
              status urządzeń i przeglądaj historię zdarzeń.
            </p>
          </div>

          <Image
            src="/images/securityHeader.svg"
            alt="schedule"
            width={300}
            height={300}
            className="h-full object-contain"
          />
        </div>
      </section>

      {/* Podsumowanie */}
      <section>
        <SectionHeading
          title="Status bezpieczeństwa"
          description="Szybki przegląd urządzeń i zgłoszonych problemów."
          icon={<MdShield size={23} />}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            icon={<MdCameraAlt size={23} />}
            label="Kamery online"
            value={`${onlineCameras}/${cameras.length}`}
            description="Dostępne urządzenia"
          />
          <OverviewCard
            icon={<MdOutlineSensors size={23} />}
            label="Czujniki online"
            value={`${onlineSensors}/${sensors.length}`}
            description="Połączone czujniki"
          />
          <OverviewCard
            icon={<MdWarning size={23} />}
            label="Wymaga uwagi"
            value={String(offlineDevices.length)}
            description="Urządzenia offline lub z ostrzeżeniem"
            warning={offlineDevices.length > 0}
          />
          <OverviewCard
            icon={<MdHistory size={23} />}
            label="Niepotwierdzone zdarzenia"
            value={String(unacknowledgedEvents.length)}
            description="Wymagają sprawdzenia przez użytkownika"
            warning={unacknowledgedEvents.length > 0}
          />
        </div>
      </section>

      {/* Centrala alarmowa */}
      <section>
        <SectionHeading
          title="System alarmowy"
          description="Status centrali alarmowej."
          icon={<MdLock size={23} />}
        />

        <div className="rounded-2xl bg-[#19483D] p-5 text-white sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <MdLock size={29} />
              </div>
              <div>
                <p className="text-sm text-white/65">{mockAlarm.name}</p>
                <h3 className="mt-1 text-xl font-extrabold">
                  {mockAlarm.status === "ARMED"
                    ? "System uzbrojony"
                    : mockAlarm.status === "DISARMED"
                      ? "System rozbrojony"
                      : mockAlarm.status === "ALARM"
                        ? "Alarm aktywny"
                        : "Brak połączenia"}
                </h3>
                <p className="mt-1 text-xs text-white/60">
                  Ostatnia aktualizacja: {formatTime(mockAlarm.lastUpdated)}
                </p>
              </div>
            </div>

            <span className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#B7D8C9]" />
              Status demonstracyjny
            </span>
          </div>

          <div className="mt-5 border-t border-white/15 pt-4 text-sm leading-6 text-white/65">
            Rzeczywiste uzbrajanie i rozbrajanie będzie możliwe dopiero po
            podłączeniu kompatybilnej centrali i odpowiednio zabezpieczonej
            integracji.
          </div>
        </div>
      </section>

      {/* Kamery */}
      <section>
        <SectionHeading
          title="Monitoring"
          description="Podgląd kamer i status połączenia."
          icon={<MdCameraAlt size={23} />}
          action={
            <button
              type="button"
              onClick={handleAddDevice}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#287969] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#19483D]"
            >
              <MdAdd size={20} />
              Dodaj urządzenie
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cameras.map((camera, index) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              variant={index}
              onClick={() => setSelectedCamera(camera)}
            />
          ))}
        </div>
      </section>

      {/* Czujniki */}
      <section>
        <SectionHeading
          title="Czujniki"
          description="Gaz, zalanie, dym, tlenek węgla i pozostałe urządzenia."
          icon={<MdOutlineSensors size={23} />}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sensors.map((sensor) => (
            <SensorCard
              key={sensor.id}
              sensor={sensor}
              onClick={() => setSelectedSensor(sensor)}
            />
          ))}
        </div>
      </section>

      {/* Historia zdarzeń */}
      <section>
        <SectionHeading
          title="Historia zdarzeń"
          description="Ostrzeżenia i informacje zgromadzone w systemie demonstracyjnym."
          icon={<MdHistory size={23} />}
          action={
            <button
              type="button"
              onClick={() => setShowAllEvents((current) => !current)}
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-bold text-[#287969] transition hover:bg-[#E2F0EB]"
            >
              {showAllEvents ? "Pokaż mniej" : "Zobacz wszystkie"}
            </button>
          }
        />

        <div className="overflow-hidden rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA]">
          {visibleEvents.length === 0 ? (
            <p className="p-6 text-sm text-[#839087]">
              Brak zdarzeń do wyświetlenia.
            </p>
          ) : (
            visibleEvents.map((event, index) => (
              <EventRow
                key={event.id}
                event={event}
                last={index === visibleEvents.length - 1}
                onAcknowledge={() => acknowledgeEvent(event.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* Szczegóły kamery */}
      {selectedCamera && (
        <CameraModal
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      )}

      {/* Szczegóły czujnika */}
      {selectedSensor && (
        <SensorModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
}

function SectionHeading({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#19483D]">{title}</h2>
          <p className="mt-1 text-sm text-[#839087]">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  description,
  warning = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 transition hover:border-[#B7CFC2]">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          warning
            ? "bg-[#FFF0D6] text-[#96661B]"
            : "bg-[#E2F0EB] text-[#287969]"
        }`}
      >
        {icon}
      </div>
      <p className="mt-4 text-sm font-medium text-[#839087]">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold tracking-tight ${
          warning ? "text-[#96661B]" : "text-[#19483D]"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#839087]">{description}</p>
    </div>
  );
}

function CameraCard({
  camera,
  variant,
  onClick,
}: {
  camera: SecurityCamera;
  variant: number;
  onClick: () => void;
}) {
  const online = camera.status === "ONLINE";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] text-left transition hover:border-[#B7CFC2]"
    >
      <div
        className={`relative flex h-48 items-center justify-center overflow-hidden ${
          variant % 2 === 0
            ? "bg-gradient-to-br from-[#344A41] via-[#53695B] to-[#263C35]"
            : "bg-gradient-to-br from-[#43554C] via-[#758574] to-[#263C35]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute inset-x-0 top-1/3 h-px bg-white" />
          <div className="absolute inset-x-0 top-2/3 h-px bg-white" />
          <div className="absolute inset-y-0 left-1/3 w-px bg-white" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-white" />
        </div>

        <div className="relative flex flex-col items-center gap-2 text-white/70">
          {online ? <MdCameraAlt size={45} /> : <MdWifiOff size={45} />}
          <span className="text-xs font-semibold">
            {online ? "Podgląd niedostępny w trybie demo" : "Brak połączenia"}
          </span>
        </div>

        <div className="absolute left-3 top-3 rounded-lg bg-black/30 px-2.5 py-1 text-xs font-bold text-white">
          {camera.location}
        </div>

        <span
          className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
            online
              ? "bg-[#E2F0EB] text-[#287969]"
              : "bg-[#FBE9E5] text-[#B34D3D]"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {statusConfig[camera.status].label}
        </span>

        <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/25 text-white opacity-0 transition group-hover:opacity-100">
          <MdSettings size={20} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[#19483D]">{camera.name}</h3>
        <p className="mt-1 text-xs text-[#839087]">
          Ostatni sygnał: {formatTime(camera.lastSeen)}
        </p>
      </div>
    </button>
  );
}

function SensorCard({
  sensor,
  onClick,
}: {
  sensor: SecuritySensor;
  onClick: () => void;
}) {
  const config = sensorConfig[sensor.type];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4 text-left transition hover:border-[#B7CFC2]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              sensor.status === "ONLINE"
                ? "bg-[#E2F0EB] text-[#287969]"
                : "bg-[#FBE9E5] text-[#B34D3D]"
            }`}
          >
            <Icon size={23} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#19483D]">{sensor.name}</h3>
            <p className="mt-1 text-xs text-[#839087]">{sensor.location}</p>
          </div>
        </div>
        <MdSettings size={19} className="shrink-0 text-[#839087]" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#DCE4D9] pt-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            statusConfig[sensor.status].className
          }`}
        >
          {statusConfig[sensor.status].label}
        </span>

        {sensor.batteryLevel !== null && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              sensor.batteryLevel < 20 ? "text-[#B34D3D]" : "text-[#839087]"
            }`}
          >
            {sensor.batteryLevel < 20 && <MdOutlineBatteryAlert size={17} />}
            Bateria {sensor.batteryLevel}%
          </span>
        )}
      </div>
    </button>
  );
}

function EventRow({
  event,
  last,
  onAcknowledge,
}: {
  event: SecurityEvent;
  last: boolean;
  onAcknowledge: () => void;
}) {
  const config = {
    INFO: {
      label: "Informacja",
      icon: <MdCheckCircle size={21} />,
      style: "bg-[#E2F0EB] text-[#287969]",
    },
    WARNING: {
      label: "Ostrzeżenie",
      icon: <MdErrorOutline size={21} />,
      style: "bg-[#FFF0D6] text-[#96661B]",
    },
    CRITICAL: {
      label: "Krytyczne",
      icon: <MdWarning size={21} />,
      style: "bg-[#FBE9E5] text-[#B34D3D]",
    },
  }[event.severity];

  return (
    <div
      className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
        last ? "" : "border-b border-[#DCE4D9]"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.style}`}
        >
          {config.icon}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-[#19483D]">{event.title}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${config.style}`}
            >
              {config.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#839087]">{event.description}</p>
          <p className="mt-2 text-xs text-[#839087]">
            {formatTime(event.timestamp)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:justify-end">
        {event.acknowledged ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-[#287969]">
            <MdCheckCircle size={17} />
            Sprawdzone
          </span>
        ) : (
          <button
            type="button"
            onClick={onAcknowledge}
            className="cursor-pointer rounded-xl border border-[#DCE4D9] px-3 py-2 text-xs font-bold text-[#287969] transition hover:bg-[#E2F0EB]"
          >
            Oznacz jako sprawdzone
          </button>
        )}
      </div>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#19483D]/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 shadow-xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#19483D]">{title}</h2>
            <p className="mt-2 text-sm text-[#839087]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#839087] transition hover:bg-[#F5F6EE] hover:text-[#19483D]"
          >
            <MdClose size={22} />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function CameraModal({
  camera,
  onClose,
}: {
  camera: SecurityCamera;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={camera.name}
      subtitle={`Lokalizacja: ${camera.location}`}
      onClose={onClose}
    >
      <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-2xl bg-[#263C35] text-white/70">
        {camera.status === "ONLINE" ? (
          <MdCameraAlt size={48} />
        ) : (
          <MdWifiOff size={48} />
        )}
        <p className="text-sm font-semibold">
          {camera.status === "ONLINE"
            ? "Brak podłączonego strumienia wideo"
            : "Kamera jest offline"}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <DetailRow label="Status" value={statusConfig[camera.status].label} />
        <DetailRow label="Ostatni sygnał" value={formatTime(camera.lastSeen)} />
        <DetailRow label="Źródło obrazu" value="Nie skonfigurowano" />
      </div>
    </ModalShell>
  );
}

function SensorModal({
  sensor,
  onClose,
}: {
  sensor: SecuritySensor;
  onClose: () => void;
}) {
  const config = sensorConfig[sensor.type];
  const Icon = config.icon;

  return (
    <ModalShell
      title={sensor.name}
      subtitle={`Typ: ${config.label} · ${sensor.location}`}
      onClose={onClose}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-[#F5F6EE] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
          <Icon size={26} />
        </div>
        <div>
          <p className="font-bold text-[#19483D]">
            {statusConfig[sensor.status].label}
          </p>
          <p className="mt-1 text-sm text-[#839087]">
            Odczyt: {formatTime(sensor.lastSeen)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <DetailRow label="Lokalizacja" value={sensor.location} />
        <DetailRow
          label="Poziom baterii"
          value={
            sensor.batteryLevel === null
              ? "Brak danych"
              : `${sensor.batteryLevel}%`
          }
        />
        <DetailRow
          label="Wykryte zagrożenie"
          value={sensor.triggered ? "Tak" : "Nie"}
        />
      </div>

      <p className="mt-5 rounded-xl bg-[#FFF0D6] p-3 text-xs leading-5 text-[#96661B]">
        To dane demonstracyjne. Brak wskazanego zagrożenia w aplikacji nie
        potwierdza bezpieczeństwa pomieszczenia. Polegaj na rzeczywistym
        czujniku i jego alarmie.
      </p>
    </ModalShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[#839087]">{label}</span>
      <span className="text-right text-sm font-semibold text-[#263C35]">
        {value}
      </span>
    </div>
  );
}
