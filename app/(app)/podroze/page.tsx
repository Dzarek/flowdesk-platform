import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import TravelPageContent from "@/components/travel/TravelPageContent";

export default async function PodrozePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <TravelPageContent initialTrips={[]} canManageTrips={false} />;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      familyId: true,
      familyMember: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!user?.familyId || !user.familyMember) {
    return <TravelPageContent initialTrips={[]} canManageTrips={false} />;
  }

  const trips = await prisma.familyTrip.findMany({
    where: {
      familyId: user.familyId,
    },
    include: {
      places: {
        orderBy: {
          position: "asc",
        },
      },
      checklist: {
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  const initialTrips = trips.map((trip) => ({
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
  }));

  const canManageTrips =
    user.familyMember.role === "HEAD" || user.familyMember.role === "ADULT";

  return (
    <TravelPageContent
      initialTrips={initialTrips}
      canManageTrips={canManageTrips}
    />
  );
}
