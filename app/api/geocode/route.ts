import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Wpisz nazwę miejsca." },
      { status: 400 },
    );
  }

  if (query.length > 200) {
    return NextResponse.json(
      { error: "Wyszukiwana fraza jest za długa." },
      { status: 400 },
    );
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");

    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");
    url.searchParams.set("accept-language", "pl");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "LifeHub/1.0 (family travel planner)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Usługa wyszukiwania miejsc jest chwilowo niedostępna." },
        { status: 502 },
      );
    }

    const results = await response.json();

    const places = results.map(
      (item: {
        place_id: number;
        lat: string;
        lon: string;
        name?: string;
        display_name: string;
        address?: { country?: string };
      }) => ({
        id: String(item.place_id),
        name: item.name || item.display_name.split(",")[0],
        displayName: item.display_name,
        country: item.address?.country || "",
        latitude: Number(item.lat),
        longitude: Number(item.lon),
      }),
    );

    return NextResponse.json(places, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się połączyć z usługą wyszukiwania miejsc." },
      { status: 502 },
    );
  }
}
