import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GeocodingResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type WeatherResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
  };
};

type AirQualityResponse = {
  current?: {
    time: string;
    european_aqi: number;
  };
};

export async function GET() {
  try {
    // 1. Sprawdź sesję użytkownika
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musisz się zalogować." },
        { status: 401 },
      );
    }

    // 2. Pobierz miejscowość zalogowanego użytkownika
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        city: true,
      },
    });

    if (!user?.city?.trim()) {
      return NextResponse.json(
        { error: "Ustaw swoją miejscowość w ustawieniach." },
        { status: 400 },
      );
    }

    const city = user.city.trim();

    // 3. Znajdź współrzędne miejscowości
    const geocodingUrl = new URL(
      "https://geocoding-api.open-meteo.com/v1/search",
    );

    geocodingUrl.searchParams.set("name", city);
    geocodingUrl.searchParams.set("count", "10");
    geocodingUrl.searchParams.set("language", "pl");
    geocodingUrl.searchParams.set("countryCode", "PL");
    geocodingUrl.searchParams.set("format", "json");

    const geocodingResponse = await fetch(geocodingUrl, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });

    if (!geocodingResponse.ok) {
      throw new Error("Nie udało się znaleźć miejscowości.");
    }

    const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

    const location = geocodingData.results?.[0];

    if (!location) {
      return NextResponse.json(
        { error: "Nie znaleziono miejscowości w Polsce." },
        { status: 404 },
      );
    }

    const { latitude, longitude } = location;

    // 4. Pobierz aktualną temperaturę i wilgotność
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");

    weatherUrl.searchParams.set("latitude", String(latitude));
    weatherUrl.searchParams.set("longitude", String(longitude));
    weatherUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m",
    );
    weatherUrl.searchParams.set("timezone", "auto");

    // 5. Pobierz europejski indeks jakości powietrza
    const airQualityUrl = new URL(
      "https://air-quality-api.open-meteo.com/v1/air-quality",
    );

    airQualityUrl.searchParams.set("latitude", String(latitude));
    airQualityUrl.searchParams.set("longitude", String(longitude));
    airQualityUrl.searchParams.set("current", "european_aqi");
    airQualityUrl.searchParams.set("timezone", "auto");

    // Zapytania do obu API wykonujemy równolegle
    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl, {
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }),
      fetch(airQualityUrl, {
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }),
    ]);

    if (!weatherResponse.ok || !airQualityResponse.ok) {
      throw new Error("Nie udało się pobrać danych pogodowych.");
    }

    const [weatherData, airQualityData] = (await Promise.all([
      weatherResponse.json(),
      airQualityResponse.json(),
    ])) as [WeatherResponse, AirQualityResponse];

    const weather = weatherData.current;
    const airQuality = airQualityData.current;

    if (
      !weather ||
      typeof weather.temperature_2m !== "number" ||
      typeof weather.relative_humidity_2m !== "number"
    ) {
      throw new Error("Brak aktualnych danych pogodowych.");
    }

    if (!airQuality || typeof airQuality.european_aqi !== "number") {
      throw new Error("Brak aktualnych danych o jakości powietrza.");
    }

    // 6. Zwróć dane dla WeatherWidget.tsx
    return NextResponse.json(
      {
        city: location.name,
        temperature: weather.temperature_2m,
        humidity: weather.relative_humidity_2m,
        airQuality: airQuality.european_aqi,
        updatedAt: weather.time,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Weather API error:", error);

    return NextResponse.json(
      { error: "Nie udało się pobrać aktualnych danych pogodowych." },
      { status: 502 },
    );
  }
}
