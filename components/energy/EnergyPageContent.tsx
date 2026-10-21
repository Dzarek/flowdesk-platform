"use client";

import Image from "next/image";
import {
  MdAdd,
  MdBolt,
  MdCheckCircle,
  MdCloudSync,
  MdHome,
  MdOutlineElectricBolt,
  MdOutlineSolarPower,
  MdThermostat,
  MdWaterDrop,
  MdSettings,
  MdClose,
} from "react-icons/md";
import {
  mockHeating,
  mockSolar,
  mockUtilityMeters,
} from "@/lib/energy/mock-data";
import { FaGripfire } from "react-icons/fa";
import { useState } from "react";

const formatNumber = (value: number, decimals = 1) =>
  new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(value);

const utilityLabels = {
  ELECTRICITY: "Prąd",
  GAS: "Gaz",
  WATER: "Woda",
};

const utilityIcons = {
  ELECTRICITY: MdOutlineElectricBolt,
  GAS: FaGripfire,
  WATER: MdWaterDrop,
};

export default function EnergyPageContent() {
  const [meters, setMeters] = useState(mockUtilityMeters);
  const [editingMeterId, setEditingMeterId] = useState<string | null>(null);

  const editingMeter = meters.find((meter) => meter.id === editingMeterId);

  const utilityCosts = meters.map((meter) => {
    const monthlyUsage = Math.max(
      0,
      meter.currentReading - meter.previousReading,
    );

    const variableCost = monthlyUsage * meter.unitPrice;
    const totalCost = variableCost + meter.fixedMonthlyCost;

    return {
      ...meter,
      monthlyUsage,
      variableCost,
      totalCost,
    };
  });

  const totalMonthlyCost = utilityCosts.reduce(
    (total, meter) => total + meter.totalCost,
    0,
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Nagłówek */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#E2F0EB]" />

        <div className="relative flex h-[230px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#287969]">
              <MdOutlineSolarPower size={21} />
              <span>Inteligentny dom</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#19483D] sm:text-5xl">
              Energia i media
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-[#718078]">
              Kontroluj ogrzewanie, produkcję energii i zużycie mediów. <br />
              Wszystkie najważniejsze informacje o Twoim domu w jednym miejscu.
            </p>
          </div>
          <div className="flex flex-col gap-1 items-center justify-center p-6  rounded-2xl bg-white ">
            <p className="text-sm uppercase font-medium text-[#839087] mb-2">
              Szacowany koszt w tym miesiącu
            </p>
            <p className="text-2xl font-extrabold text-[#19483D]">
              {formatCurrency(totalMonthlyCost)}
            </p>
          </div>
          <Image
            src="/images/energyHeader.svg"
            alt="Energia i instalacje domowe"
            width={400}
            height={400}
            priority
            className=" h-full  object-contain "
          />
        </div>
      </section>

      {/* Ogrzewanie */}
      <section>
        <SectionHeading
          title="Ogrzewanie"
          description="Stan kotła i temperatura w domu."
          icon={<MdThermostat size={23} />}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#839087]">
                  {mockHeating.name}
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-[#19483D]">
                  {mockHeating.manufacturer} {mockHeating.model}
                </h3>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                  mockHeating.status === "ONLINE"
                    ? "bg-[#E2F0EB] text-[#287969]"
                    : "bg-[#FBE9E5] text-[#B34D3D]"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {mockHeating.status === "ONLINE"
                  ? "Połączony"
                  : "Brak połączenia"}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MetricBox
                label="Temperatura w domu"
                value={`${formatNumber(mockHeating.roomTemperature)}°C`}
              />
              <MetricBox
                label="Temperatura zadana"
                value={`${formatNumber(mockHeating.targetTemperature)}°C`}
              />
              <MetricBox
                label="Temperatura kotła"
                value={`${formatNumber(mockHeating.boilerTemperature, 0)}°C`}
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[#DCE4D9] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#839087]">Tryb pracy</p>
                <p className="mt-1 font-bold text-[#263C35]">
                  {mockHeating.mode === "AUTO"
                    ? "Automatyczny"
                    : mockHeating.mode === "MANUAL"
                      ? "Ręczny"
                      : "Wyłączony"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-[#287969]">
                <MdCheckCircle size={20} />
                {mockHeating.heatingActive
                  ? "Ogrzewanie aktywne"
                  : "Ogrzewanie nieaktywne"}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-[#19483D] p-5 text-white">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <MdThermostat size={25} />
              </div>

              <p className="mt-5 text-sm text-white/65">
                Temperatura pomieszczenia
              </p>
              <p className="mt-1 text-4xl font-extrabold">
                {formatNumber(mockHeating.roomTemperature)}°C
              </p>
            </div>

            <div className="mt-6 border-t border-white/15 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/65">Do temperatury zadanej</span>
                <span className="font-bold">
                  {formatNumber(
                    mockHeating.targetTemperature - mockHeating.roomTemperature,
                  )}
                  °C
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#B7D8C9]"
                  style={{
                    width: `${Math.min(
                      100,
                      (mockHeating.roomTemperature /
                        mockHeating.targetTemperature) *
                        100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fotowoltaika */}
      <section>
        <SectionHeading
          title="Fotowoltaika i energia"
          description="Produkcja instalacji PV oraz przepływ energii."
          icon={<MdOutlineSolarPower size={23} />}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Produkcja dzisiaj"
            value={`${formatNumber(mockSolar.dailyProductionKwh)} kWh`}
            icon={<MdOutlineSolarPower size={22} />}
          />
          <MetricCard
            label="Produkcja w miesiącu"
            value={`${formatNumber(mockSolar.monthlyProductionKwh)} kWh`}
            icon={<MdBolt size={22} />}
          />
          <MetricCard
            label="Pobór z sieci"
            value={`${formatNumber(mockSolar.gridImportKw)} kW`}
            icon={<MdOutlineElectricBolt size={22} />}
          />
          <MetricCard
            label="Oddawanie do sieci"
            value={`${formatNumber(mockSolar.gridExportKw)} kW`}
            icon={<MdCloudSync size={22} />}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-extrabold text-[#19483D]">
                Produkcja i zużycie energii
              </h3>
              <p className="mt-1 text-sm text-[#839087]">
                Przykładowy profil dobowy w kW.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#718078]">
              <Legend color="#287969" label="Produkcja PV" />
              <Legend color="#B7C8A7" label="Zużycie domu" />
            </div>
          </div>

          <div className="mt-6 flex h-52 items-end gap-2 border-b border-[#DCE4D9] pb-2 sm:gap-4">
            {mockSolar.dailyHistory.map((point) => {
              const maxValue = Math.max(
                ...mockSolar.dailyHistory.flatMap((item) => [
                  item.production,
                  item.consumption,
                ]),
              );

              return (
                <div
                  key={point.time}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-full w-full items-end justify-center gap-1">
                    <div
                      title={`Produkcja: ${point.production} kW`}
                      className="w-1/2 max-w-5 rounded-t-md bg-[#287969] transition-all"
                      style={{
                        height: `${Math.max(
                          3,
                          (point.production / maxValue) * 100,
                        )}%`,
                      }}
                    />
                    <div
                      title={`Zużycie: ${point.consumption} kW`}
                      className="w-1/2 max-w-5 rounded-t-md bg-[#B7C8A7] transition-all"
                      style={{
                        height: `${Math.max(
                          3,
                          (point.consumption / maxValue) * 100,
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-[10px] text-[#839087] sm:text-xs">
                    {point.time}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#F5F6EE] p-4">
              <p className="text-sm text-[#839087]">Zużycie domu</p>
              <p className="mt-1 text-xl font-extrabold text-[#19483D]">
                {formatNumber(mockSolar.homeConsumptionKw)} kW
              </p>
            </div>
            <div className="rounded-xl bg-[#F5F6EE] p-4">
              <p className="text-sm text-[#839087]">Stan instalacji</p>
              <p className="mt-1 flex items-center gap-2 font-bold text-[#287969]">
                <MdCheckCircle size={19} />
                {mockSolar.status === "ONLINE"
                  ? "Urządzenie dostępne"
                  : "Sprawdź połączenie"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Liczniki mediów */}
      <section>
        <SectionHeading
          title="Liczniki i koszty mediów"
          description="Odczyty, zużycie i orientacyjne koszty bieżącego okresu."
          icon={<MdWaterDrop size={23} />}
        />

        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#839087]">Szacowany koszt łącznie</p>
          <p className="text-2xl font-extrabold text-[#19483D]">
            {formatCurrency(totalMonthlyCost)}
            <span className="ml-2 text-xs font-medium text-[#839087]">
              / miesiąc
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {utilityCosts.map((meter) => {
            const Icon = utilityIcons[meter.type];

            return (
              <article
                key={meter.id}
                className="rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 transition hover:border-[#B7CFC2]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
                      <Icon size={25} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#839087]">
                        {utilityLabels[meter.type]}
                      </p>

                      <h3 className="mt-1 font-bold text-[#19483D]">
                        {meter.name}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingMeterId(meter.id)}
                    aria-label={`Edytuj ustawienia licznika: ${meter.name}`}
                    title="Ustawienia licznika"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#839087] transition hover:bg-[#E2F0EB] hover:text-[#287969]"
                  >
                    <MdSettings size={21} />
                  </button>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-[#839087]">
                    Bieżący stan licznika
                  </p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#19483D]">
                    {formatNumber(meter.currentReading)}{" "}
                    <span className="text-sm font-semibold text-[#839087]">
                      {meter.unit}
                    </span>
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#F5F6EE] p-3">
                    <p className="text-xs text-[#839087]">Zużycie</p>
                    <p className="mt-1 font-extrabold text-[#263C35]">
                      {formatNumber(meter.monthlyUsage)} {meter.unit}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F5F6EE] p-3">
                    <p className="text-xs text-[#839087]">Koszt szacowany</p>
                    <p className="mt-1 font-extrabold text-[#287969]">
                      {formatCurrency(meter.totalCost)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-[#DCE4D9] pt-4 text-sm">
                  <DetailRow
                    label="Poprzedni odczyt"
                    value={`${formatNumber(meter.previousReading)} ${meter.unit}`}
                  />
                  <DetailRow
                    label="Koszt zmienny"
                    value={formatCurrency(meter.variableCost)}
                  />
                  <DetailRow
                    label="Opłaty stałe"
                    value={formatCurrency(meter.fixedMonthlyCost)}
                  />
                  <DetailRow
                    label="Data odczytu"
                    value={new Date(
                      `${meter.lastReadingDate}T12:00:00`,
                    ).toLocaleDateString("pl-PL")}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-[#343935]">
          Koszty mają charakter poglądowy. Nie uwzględniają wszystkich możliwych
          opłat taryfowych, dystrybucyjnych ani indywidualnych zasad rozliczania
          fotowoltaiki.
        </p>
      </section>
      {editingMeter && (
        <MeterSettingsModal
          key={editingMeter.id}
          meter={editingMeter}
          onClose={() => setEditingMeterId(null)}
          onSave={(updatedMeter) => {
            setMeters((currentMeters) =>
              currentMeters.map((meter) =>
                meter.id === updatedMeter.id ? updatedMeter : meter,
              ),
            );

            setEditingMeterId(null);
          }}
        />
      )}
    </div>
  );
}

function SectionHeading({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-[#19483D]">{title}</h2>
        <p className="mt-1 text-sm text-[#839087]">{description}</p>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#F5F6EE] p-4">
      <p className="text-xs font-medium text-[#839087]">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-[#19483D]">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#839087]">{label}</p>
        <span className="text-[#287969]">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-[#19483D]">{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#839087]">{label}</span>
      <span className="text-right font-semibold text-[#263C35]">{value}</span>
    </div>
  );
}

function MeterSettingsModal({
  meter,
  onClose,
  onSave,
}: {
  meter: (typeof mockUtilityMeters)[number];
  onClose: () => void;
  onSave: (meter: (typeof mockUtilityMeters)[number]) => void;
}) {
  const [currentReading, setCurrentReading] = useState(
    String(meter.currentReading),
  );
  const [previousReading, setPreviousReading] = useState(
    String(meter.previousReading),
  );
  const [unitPrice, setUnitPrice] = useState(String(meter.unitPrice));
  const [fixedMonthlyCost, setFixedMonthlyCost] = useState(
    String(meter.fixedMonthlyCost),
  );

  const current = Number(currentReading.replace(",", "."));
  const previous = Number(previousReading.replace(",", "."));
  const price = Number(unitPrice.replace(",", "."));
  const fixed = Number(fixedMonthlyCost.replace(",", "."));

  const valid =
    currentReading.trim() !== "" &&
    previousReading.trim() !== "" &&
    unitPrice.trim() !== "" &&
    fixedMonthlyCost.trim() !== "" &&
    [current, previous, price, fixed].every(Number.isFinite) &&
    current >= previous &&
    previous >= 0 &&
    price >= 0 &&
    fixed >= 0;

  const usage = Math.max(0, current - previous);
  const estimatedCost = usage * price + fixed;

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#DCE4D9] bg-[#FEFEFA] px-4 py-3 text-sm text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!valid) return;

    onSave({
      ...meter,
      currentReading: current,
      previousReading: previous,
      monthlyUsage: usage,
      unitPrice: price,
      fixedMonthlyCost: fixed,
      lastReadingDate: new Date().toLocaleDateString("en-CA"),
    });
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#19483D]/35 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meter-settings-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 shadow-xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#287969]">
              Ustawienia licznika
            </p>
            <h2
              id="meter-settings-title"
              className="mt-1 text-2xl font-extrabold text-[#19483D]"
            >
              {meter.name}
            </h2>
            <p className="mt-2 text-sm text-[#839087]">
              Wprowadź odczyty i skonfiguruj szacunkowe koszty.
            </p>
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <h3 className="font-bold text-[#263C35]">Odczyty licznika</h3>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#718078]">
                Aktualny stan ({meter.unit})
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={currentReading}
                  onChange={(event) => setCurrentReading(event.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-medium text-[#718078]">
                Poprzedni stan ({meter.unit})
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={previousReading}
                  onChange={(event) => setPreviousReading(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <p className="mt-3 text-sm text-[#839087]">
              Zużycie między odczytami:{" "}
              <strong className="text-[#19483D]">
                {Number.isFinite(usage)
                  ? new Intl.NumberFormat("pl-PL", {
                      maximumFractionDigits: 3,
                    }).format(usage)
                  : "—"}{" "}
                {meter.unit}
              </strong>
            </p>
          </div>

          <div className="border-t border-[#DCE4D9] pt-5">
            <h3 className="font-bold text-[#263C35]">Koszty</h3>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#718078]">
                Cena za jednostkę (zł/{meter.unit})
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-medium text-[#718078]">
                Opłaty stałe (zł/mies.)
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={fixedMonthlyCost}
                  onChange={(event) => setFixedMonthlyCost(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F5F6EE] p-4">
            <p className="text-sm text-[#839087]">
              Szacunkowy koszt zużycia i opłat stałych
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#19483D]">
              {Number.isFinite(estimatedCost)
                ? new Intl.NumberFormat("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                  }).format(estimatedCost)
                : "—"}
            </p>
            <p className="mt-1 text-xs text-[#839087]">
              Zużycie × cena jednostkowa + opłaty stałe.
            </p>
          </div>

          {!valid && (
            <p className="text-sm text-[#B34D3D]">
              Sprawdź dane. Odczyty i koszty muszą być nieujemne, a aktualny
              stan nie może być mniejszy od poprzedniego.
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-[#DCE4D9] px-5 py-3 text-sm font-bold text-[#718078] transition hover:bg-[#F5F6EE]"
            >
              Anuluj
            </button>

            <button
              type="submit"
              disabled={!valid}
              className="cursor-pointer rounded-xl bg-[#287969] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#19483D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Zapisz ustawienia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
