"use server";

import "server-only";

import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { TravelStatus } from "@prisma/client";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { supabaseStorage, FAMILY_TRIPS_BUCKET } from "@/lib/supabase/storage";

import type { Trip, TripChecklistItem } from "@/lib/travel/types";

// -----------------------------------------------------
// Types
// -----------------------------------------------------

type ActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

type TripPlaceInput = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

type TripFormData = {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: TravelStatus;
  places: TripPlaceInput[];
};

type FamilyContext = {
  userId: string;
  familyId: string;
  memberId: string;
  role: "HEAD" | "ADULT" | "CHILD";
};

// -----------------------------------------------------
// Family context and permissions
// -----------------------------------------------------

async function getFamilyContext(): Promise<FamilyContext | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      familyId: true,
      familyMember: {
        select: {
          id: true,
          role: true,
        },
      },
      family: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user?.familyId || !user.familyMember || !user.family) {
    return null;
  }

  if (user.family.id !== user.familyId) {
    return null;
  }

  return {
    userId: user.id,
    familyId: user.familyId,
    memberId: user.familyMember.id,
    role: user.familyMember.role,
  };
}

async function requireAdult() {
  const context = await getFamilyContext();

  if (!context) {
    return {
      context: null,
      error: "Nie masz dostępu do rodziny.",
    };
  }

  if (context.role === "CHILD") {
    return {
      context: null,
      error: "Nie masz uprawnień do zarządzania podróżami.",
    };
  }

  return {
    context,
    error: null,
  };
}

// -----------------------------------------------------
// Validation
// -----------------------------------------------------

function parseTripFormData(formData: FormData): TripFormData {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDateValue = String(formData.get("startDate") ?? "");
  const endDateValue = String(formData.get("endDate") ?? "");
  const statusValue = String(formData.get("status") ?? "");

  if (!title) {
    throw new Error("Podaj nazwę podróży.");
  }

  if (title.length > 120) {
    throw new Error("Nazwa podróży może mieć maksymalnie 120 znaków.");
  }

  if (description.length > 5000) {
    throw new Error("Opis podróży jest zbyt długi.");
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDateValue) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDateValue)
  ) {
    throw new Error("Podaj prawidłowe daty podróży.");
  }

  const startDate = new Date(`${startDateValue}T00:00:00.000Z`);
  const endDate = new Date(`${endDateValue}T00:00:00.000Z`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate.toISOString().slice(0, 10) !== startDateValue ||
    endDate.toISOString().slice(0, 10) !== endDateValue
  ) {
    throw new Error("Podane daty są nieprawidłowe.");
  }

  if (endDate < startDate) {
    throw new Error(
      "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.",
    );
  }

  if (statusValue !== "PLANNED" && statusValue !== "COMPLETED") {
    throw new Error("Nieprawidłowy status podróży.");
  }

  let places: TripPlaceInput[];

  try {
    const parsed = JSON.parse(String(formData.get("places") ?? "[]"));

    if (!Array.isArray(parsed)) {
      throw new Error();
    }

    places = parsed.map((place) => {
      const name = String(place.name ?? "").trim();
      const country = String(place.country ?? "").trim();
      const latitude = Number(place.latitude);
      const longitude = Number(place.longitude);

      if (!name || !country) {
        throw new Error("Każde miejsce musi mieć nazwę i kraj.");
      }

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error(`Nieprawidłowe współrzędne miejsca: ${name}.`);
      }

      return {
        name,
        country,
        latitude,
        longitude,
      };
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message !== "Unexpected end of JSON input"
    ) {
      throw error;
    }

    throw new Error("Nie udało się odczytać listy miejsc podróży.");
  }

  return {
    title,
    description,
    startDate,
    endDate,
    status: statusValue as TravelStatus,
    places,
  };
}

// -----------------------------------------------------
// Storage
// -----------------------------------------------------

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadTripCover(
  file: File,
  familyId: string,
  tripId: string,
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Nie wybrano zdjęcia.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Zdjęcie może mieć maksymalnie 5 MB.");
  }

  const extension = IMAGE_EXTENSIONS[file.type];

  if (!extension) {
    throw new Error("Dozwolone formaty zdjęć: JPG, PNG i WebP.");
  }

  const path = `${familyId}/${tripId}/${randomUUID()}.${extension}`;

  const { error } = await supabaseStorage.storage
    .from(FAMILY_TRIPS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Trip cover upload error:", error);
    throw new Error("Nie udało się przesłać zdjęcia.");
  }

  const { data } = supabaseStorage.storage
    .from(FAMILY_TRIPS_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

async function deleteTripCover(
  imageUrl: string | null,
  familyId: string,
  tripId: string,
): Promise<void> {
  if (!imageUrl) return;

  try {
    const supabaseUrl = process.env.SUPABASE_URL;

    if (!supabaseUrl) return;

    const expectedOrigin = new URL(supabaseUrl).origin;
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.origin !== expectedOrigin) return;

    const marker = `/storage/v1/object/public/${FAMILY_TRIPS_BUCKET}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) return;

    const encodedPath = parsedUrl.pathname.slice(markerIndex + marker.length);

    const path = decodeURIComponent(encodedPath);

    if (!path.startsWith(`${familyId}/${tripId}/`)) {
      return;
    }

    const { error } = await supabaseStorage.storage
      .from(FAMILY_TRIPS_BUCKET)
      .remove([path]);

    if (error) {
      console.error("Trip cover deletion error:", error);
    }
  } catch (error) {
    console.error("Trip cover cleanup error:", error);
  }
}

// -----------------------------------------------------
// Mapping
// -----------------------------------------------------

function mapTrip(trip: {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: TravelStatus;
  coverImage: string | null;
  places: {
    id: string;
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }[];
  checklist: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}): Trip {
  return {
    id: trip.id,
    title: trip.title,
    description: trip.description ?? "",
    startDate: trip.startDate.toISOString().slice(0, 10),
    endDate: trip.endDate.toISOString().slice(0, 10),
    status: trip.status,
    coverImage: trip.coverImage,
    places: trip.places.map((place) => ({
      id: place.id,
      name: place.name,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
    })),
    checklist: trip.checklist.map((item) => ({
      id: item.id,
      title: item.title,
      completed: item.completed,
    })),
  };
}

// -----------------------------------------------------
// Create trip
// -----------------------------------------------------

export async function createTrip(
  formData: FormData,
): Promise<ActionResult<Trip>> {
  const { context, error } = await requireAdult();

  if (!context) {
    return {
      success: false,
      message: error ?? "Brak uprawnień.",
    };
  }

  let input: TripFormData;

  try {
    input = parseTripFormData(formData);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Nieprawidłowe dane podróży.",
    };
  }

  const imageValue = formData.get("coverImage");
  const imageFile =
    imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

  let createdTripId: string | null = null;

  try {
    const trip = await prisma.familyTrip.create({
      data: {
        title: input.title,
        description: input.description || null,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status,
        familyId: context.familyId,
        places: {
          create: input.places.map((place, index) => ({
            ...place,
            position: index,
          })),
        },
      },
      include: {
        places: {
          orderBy: { position: "asc" },
        },
        checklist: {
          orderBy: { position: "asc" },
        },
      },
    });

    createdTripId = trip.id;

    let coverImage: string | null = null;

    if (imageFile) {
      coverImage = await uploadTripCover(imageFile, context.familyId, trip.id);

      await prisma.familyTrip.update({
        where: {
          id: trip.id,
        },
        data: {
          coverImage,
        },
      });
    }

    return {
      success: true,
      message: "Podróż została dodana.",
      data: mapTrip({
        ...trip,
        coverImage,
      }),
    };
  } catch (error) {
    console.error("Create trip error:", error);

    if (createdTripId) {
      await prisma.familyTrip
        .deleteMany({
          where: {
            id: createdTripId,
            familyId: context.familyId,
          },
        })
        .catch(console.error);
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Nie udało się dodać podróży.",
    };
  }
}

// -----------------------------------------------------
// Update trip
// -----------------------------------------------------

export async function updateTrip(
  tripId: string,
  formData: FormData,
): Promise<ActionResult<Trip>> {
  const { context, error } = await requireAdult();

  if (!context) {
    return {
      success: false,
      message: error ?? "Brak uprawnień.",
    };
  }

  if (!tripId) {
    return {
      success: false,
      message: "Nieprawidłowa podróż.",
    };
  }

  let input: TripFormData;

  try {
    input = parseTripFormData(formData);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Nieprawidłowe dane podróży.",
    };
  }

  const existingTrip = await prisma.familyTrip.findFirst({
    where: {
      id: tripId,
      familyId: context.familyId,
    },
    select: {
      id: true,
      coverImage: true,
    },
  });

  if (!existingTrip) {
    return {
      success: false,
      message: "Nie znaleziono podróży.",
    };
  }

  const imageValue = formData.get("coverImage");
  const imageFile =
    imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

  const removeCover = formData.get("removeCover") === "true";

  let newCoverImage: string | null = null;

  try {
    if (imageFile) {
      newCoverImage = await uploadTripCover(
        imageFile,
        context.familyId,
        tripId,
      );
    }

    const updatedTrip = await prisma.familyTrip.update({
      where: {
        id: tripId,
      },
      data: {
        title: input.title,
        description: input.description || null,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status,

        ...(imageFile
          ? { coverImage: newCoverImage }
          : removeCover
            ? { coverImage: null }
            : {}),

        places: {
          deleteMany: {},
          create: input.places.map((place, index) => ({
            ...place,
            position: index,
          })),
        },
      },
      include: {
        places: {
          orderBy: { position: "asc" },
        },
        checklist: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (imageFile || removeCover) {
      await deleteTripCover(existingTrip.coverImage, context.familyId, tripId);
    }

    return {
      success: true,
      message: "Podróż została zaktualizowana.",
      data: mapTrip(updatedTrip),
    };
  } catch (error) {
    console.error("Update trip error:", error);

    if (newCoverImage) {
      await deleteTripCover(newCoverImage, context.familyId, tripId);
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nie udało się zaktualizować podróży.",
    };
  }
}

// -----------------------------------------------------
// Delete trip
// -----------------------------------------------------

export async function deleteTrip(tripId: string): Promise<ActionResult> {
  const { context, error } = await requireAdult();

  if (!context) {
    return {
      success: false,
      message: error ?? "Brak uprawnień.",
    };
  }

  const trip = await prisma.familyTrip.findFirst({
    where: {
      id: tripId,
      familyId: context.familyId,
    },
    select: {
      id: true,
      coverImage: true,
    },
  });

  if (!trip) {
    return {
      success: false,
      message: "Nie znaleziono podróży.",
    };
  }

  try {
    await prisma.familyTrip.delete({
      where: {
        id: trip.id,
      },
    });

    await deleteTripCover(trip.coverImage, context.familyId, trip.id);

    return {
      success: true,
      message: "Podróż została usunięta.",
    };
  } catch (error) {
    console.error("Delete trip error:", error);

    return {
      success: false,
      message: "Nie udało się usunąć podróży.",
    };
  }
}

// -----------------------------------------------------
// Add checklist item
// -----------------------------------------------------

export async function addTripChecklistItem(
  tripId: string,
  title: string,
): Promise<ActionResult<TripChecklistItem>> {
  const { context, error } = await requireAdult();

  if (!context) {
    return {
      success: false,
      message: error ?? "Brak uprawnień.",
    };
  }

  const cleanTitle = title.trim();

  if (!cleanTitle) {
    return {
      success: false,
      message: "Podaj nazwę elementu checklisty.",
    };
  }

  if (cleanTitle.length > 200) {
    return {
      success: false,
      message: "Nazwa może mieć maksymalnie 200 znaków.",
    };
  }

  const trip = await prisma.familyTrip.findFirst({
    where: {
      id: tripId,
      familyId: context.familyId,
    },
    select: {
      id: true,
    },
  });

  if (!trip) {
    return {
      success: false,
      message: "Nie znaleziono podróży.",
    };
  }

  try {
    const lastItem = await prisma.tripChecklistItem.aggregate({
      where: {
        tripId,
      },
      _max: {
        position: true,
      },
    });

    const item = await prisma.tripChecklistItem.create({
      data: {
        title: cleanTitle,
        tripId,
        position: (lastItem._max.position ?? -1) + 1,
      },
    });

    return {
      success: true,
      message: "Dodano element checklisty.",
      data: {
        id: item.id,
        title: item.title,
        completed: item.completed,
      },
    };
  } catch (error) {
    console.error("Add checklist item error:", error);

    return {
      success: false,
      message: "Nie udało się dodać elementu checklisty.",
    };
  }
}

// -----------------------------------------------------
// Toggle checklist item
// -----------------------------------------------------

export async function toggleTripChecklistItem(
  tripId: string,
  itemId: string,
  completed: boolean,
): Promise<ActionResult<TripChecklistItem>> {
  const { context, error } = await requireAdult();

  if (!context) {
    return {
      success: false,
      message: error ?? "Brak uprawnień.",
    };
  }

  const item = await prisma.tripChecklistItem.findFirst({
    where: {
      id: itemId,
      tripId,
      trip: {
        familyId: context.familyId,
      },
    },
  });

  if (!item) {
    return {
      success: false,
      message: "Nie znaleziono elementu checklisty.",
    };
  }

  try {
    const updatedItem = await prisma.tripChecklistItem.update({
      where: {
        id: item.id,
      },
      data: {
        completed,
      },
    });

    return {
      success: true,
      message: "Zaktualizowano checklistę.",
      data: {
        id: updatedItem.id,
        title: updatedItem.title,
        completed: updatedItem.completed,
      },
    };
  } catch (error) {
    console.error("Toggle checklist item error:", error);

    return {
      success: false,
      message: "Nie udało się zaktualizować checklisty.",
    };
  }
}

// -----------------------------------------------------
// Delete checklist item
// -----------------------------------------------------

export async function deleteTripChecklistItem(
  tripId: string,
  itemId: string,
): Promise<ActionResult> {
  const { context, error } = await requireAdult();

  if (!context) {
    return {
      success: false,
      message: error ?? "Brak uprawnień.",
    };
  }

  const item = await prisma.tripChecklistItem.findFirst({
    where: {
      id: itemId,
      tripId,
      trip: {
        familyId: context.familyId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!item) {
    return {
      success: false,
      message: "Nie znaleziono elementu checklisty.",
    };
  }

  try {
    await prisma.tripChecklistItem.delete({
      where: {
        id: item.id,
      },
    });

    return {
      success: true,
      message: "Usunięto element checklisty.",
    };
  } catch (error) {
    console.error("Delete checklist item error:", error);

    return {
      success: false,
      message: "Nie udało się usunąć elementu checklisty.",
    };
  }
}
