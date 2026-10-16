import {
  MdOutlineAir,
  MdOutlineCloud,
  MdOutlineDeviceThermostat,
  MdOutlineWaterDrop,
  MdOutlineWbSunny,
  MdOutlineThunderstorm,
  MdOutlineAcUnit,
} from "react-icons/md";

type AirQualityLevel =
  | "good"
  | "fair"
  | "moderate"
  | "poor"
  | "very-poor"
  | "unknown";

type WeatherWidgetProps = {
  city: string;
  temperature: number | null;
  humidity: number | null;
  airQuality: number | null;
  isLoading?: boolean;
  error?: string | null;
  updatedAt?: string | null;
  weatherCode: number | null;
};

function getAirQuality(value: number | null): {
  label: string;
  color: string;
  background: string;
  level: AirQualityLevel;
} {
  if (value === null || !Number.isFinite(value)) {
    return {
      label: "Brak danych",
      color: "text-gray-500",
      background: "bg-gray-100",
      level: "unknown",
    };
  }

  // Europejski indeks jakości powietrza (European AQI)
  if (value <= 20) {
    return {
      label: "Dobra",
      color: "text-emerald-700",
      background: "bg-emerald-50",
      level: "good",
    };
  }

  if (value <= 40) {
    return {
      label: "Zadowalająca",
      color: "text-lime-800",
      background: "bg-lime-50",
      level: "fair",
    };
  }

  if (value <= 60) {
    return {
      label: "Umiarkowana",
      color: "text-yellow-800",
      background: "bg-yellow-50",
      level: "moderate",
    };
  }

  if (value <= 80) {
    return {
      label: "Zła",
      color: "text-orange-700",
      background: "bg-orange-50",
      level: "poor",
    };
  }

  if (value <= 100) {
    return {
      label: "Bardzo zła",
      color: "text-red-700",
      background: "bg-red-50",
      level: "very-poor",
    };
  }

  return {
    label: "Skrajnie zła",
    color: "text-red-800",
    background: "bg-red-100",
    level: "very-poor",
  };
}

function getWeatherInfo(code: number) {
  if (code === 0) {
    return { label: "Bezchmurnie", Icon: MdOutlineWbSunny };
  }

  if (code === 1) {
    return { label: "Przeważnie słonecznie", Icon: MdOutlineWbSunny };
  }

  if (code === 2) {
    return { label: "Częściowe zachmurzenie", Icon: MdOutlineCloud };
  }

  if (code === 3) {
    return { label: "Pochmurno", Icon: MdOutlineCloud };
  }

  if (code === 45 || code === 48) {
    return { label: "Mgła", Icon: MdOutlineCloud };
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { label: "Deszcz", Icon: MdOutlineWaterDrop };
  }

  if (code >= 71 && code <= 86) {
    return { label: "Opady śniegu", Icon: MdOutlineAcUnit };
  }

  if (code >= 95 && code <= 99) {
    return { label: "Burza", Icon: MdOutlineThunderstorm };
  }

  return { label: "Warunki pogodowe", Icon: MdOutlineCloud };
}

function WeatherCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  background = "bg-white",
}: {
  title: string;
  value: string;
  unit?: string;
  icon: React.ElementType;
  description?: string;
  background?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-[#DCE4D9] ${background} p-4 transition-shadow duration-200 hover:shadow-sm`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E4EBD5]">
          <Icon className="h-5 w-5 text-[#287969]" />
        </div>

        <p className="truncate text-sm font-medium text-[#61776C]">{title}</p>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-[#263C35]">
          {value}
        </span>

        {unit && <span className="text-sm text-[#839087]">{unit}</span>}
      </div>

      {description && (
        <p className="mt-2 text-xs text-[#839087]">{description}</p>
      )}
    </div>
  );
}

export default function WeatherWidget({
  city,
  temperature,
  humidity,
  airQuality,
  isLoading = false,
  error = null,
  updatedAt = null,
  weatherCode,
}: WeatherWidgetProps) {
  const air = getAirQuality(airQuality);
  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const weather = weatherCode !== null ? getWeatherInfo(weatherCode) : null;
  return (
    <section className="rounded-4xl h-[300px] border border-[#DCE4D9] bg-[#FEFEFA] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E4EBD5]">
            {weather && <weather.Icon className="h-8 w-8 text-[#287969]" />}
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#263C35]">
              {weather && weather.label}
            </h2>

            <p className="mt-0.5 flex items-center gap-1 text-sm text-[#839087]">
              <span className="truncate">
                {city || "Nie ustawiono miejscowości"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2">
          <p className="text-muted-foreground capitalize text-sm font-semibold">
            {today}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : isLoading ? (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          aria-label="Ładowanie danych pogodowych"
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-[#F0F2EA]"
            />
          ))}
        </div>
      ) : !city ? (
        <div className="rounded-xl bg-[#F5F6EE] p-4">
          <p className="text-sm font-medium text-[#263C35]">
            Ustaw swoją miejscowość
          </p>
          <p className="mt-1 text-sm text-[#839087]">
            Po zapisaniu lokalizacji tutaj pojawią się aktualne dane pogodowe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <WeatherCard
            title="Temperatura"
            value={
              temperature === null
                ? "—"
                : temperature.toLocaleString("pl-PL", {
                    maximumFractionDigits: 1,
                  })
            }
            unit={temperature === null ? undefined : "°C"}
            icon={MdOutlineDeviceThermostat}
            description="Na zewnątrz"
            background="bg-[#F5F6EE]"
          />

          <WeatherCard
            title="Wilgotność"
            value={humidity === null ? "—" : String(Math.round(humidity))}
            unit={humidity === null ? undefined : "%"}
            icon={MdOutlineWaterDrop}
            description="Wilgotność względna"
            background="bg-[#E2F0EB]"
          />

          <WeatherCard
            title="Jakość powietrza"
            value={airQuality === null ? "—" : String(Math.round(airQuality))}
            unit={airQuality === null ? undefined : "AQI"}
            icon={MdOutlineAir}
            description={air.label}
            background="bg-[#E4EBD5]"
          />
        </div>
      )}

      {updatedAt && !isLoading && !error && (
        <p className="mt-3 text-right text-xs text-[#839087]">
          Aktualizacja:{" "}
          {new Date(updatedAt).toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}

      <p className="mt-3 text-xs text-[#839087]">
        Pogoda i jakość powietrza mogą mieć różne czasy aktualizacji.
      </p>
    </section>
  );
}
