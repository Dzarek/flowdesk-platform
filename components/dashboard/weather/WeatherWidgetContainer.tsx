"use client";

import { useCallback, useEffect, useState } from "react";
import WeatherWidget from "@/components/dashboard/weather/WeatherWidget";

type WeatherData = {
  city: string;
  temperature: number;
  humidity: number;
  airQuality: number;
  updatedAt: string;
  weatherCode: number;
};

type WeatherWidgetContainerProps = {
  refreshInterval?: number;
};

export default function WeatherWidgetContainer({
  refreshInterval = 15 * 60 * 1000,
}: WeatherWidgetContainerProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch("/api/weather", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Nie udało się pobrać danych pogodowych.",
        );
      }

      setData(result as WeatherData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWeather();

    const interval = window.setInterval(() => {
      void fetchWeather();
    }, refreshInterval);

    return () => window.clearInterval(interval);
  }, [fetchWeather, refreshInterval]);

  return (
    <WeatherWidget
      city={data?.city ?? ""}
      temperature={data?.temperature ?? null}
      humidity={data?.humidity ?? null}
      airQuality={data?.airQuality ?? null}
      updatedAt={data?.updatedAt ?? null}
      isLoading={isLoading}
      error={error}
      weatherCode={data?.weatherCode ?? null}
    />
  );
}
