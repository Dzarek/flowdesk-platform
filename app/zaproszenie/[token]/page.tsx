import { createHash } from "node:crypto";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import InvitationForm from "./InvitationForm";

type InvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;

  // Token powinien mieć dokładnie 64 znaki hex.
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    notFound();
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const invitation = await prisma.familyInvitation.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      email: true,
      status: true,
      expiresAt: true,
      family: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!invitation) {
    return (
      <InvitationMessage message="To zaproszenie nie istnieje lub link jest nieprawidłowy." />
    );
  }

  const isExpired = invitation.expiresAt <= new Date();

  if (invitation.status === "PENDING" && isExpired) {
    await prisma.familyInvitation.updateMany({
      where: {
        id: invitation.id,
        status: "PENDING",
        expiresAt: {
          lte: new Date(),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });
  }

  if (invitation.status !== "PENDING" || isExpired) {
    const message =
      invitation.status === "ACCEPTED"
        ? "To zaproszenie zostało już zaakceptowane."
        : invitation.status === "REVOKED"
          ? "To zaproszenie zostało anulowane."
          : "To zaproszenie wygasło lub nie jest już aktywne.";

    return <InvitationMessage message={message} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EDF1E7] p-4">
      <section className="w-full max-w-md rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-6 sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E2F0EB] text-3xl">
          👨‍👩‍👧‍👦
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold text-[#287969]">
            Zaproszenie do LifeHub
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-[#19483D]">
            Dołącz do rodziny
          </h1>

          <p className="mt-3 text-[#718078]">
            Otrzymujesz zaproszenie do rodziny:
          </p>

          <p className="mt-2 text-xl font-bold text-[#263C35]">
            {invitation.family.name}
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-[#F5F6EE] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#839087]">
            Zaproszenie wysłano na adres
          </p>

          <p className="mt-1 break-all font-semibold text-[#263C35]">
            {invitation.email}
          </p>

          <p className="mt-3 text-xs text-[#839087]">
            Zaproszenie jest ważne do{" "}
            {new Intl.DateTimeFormat("pl-PL", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(invitation.expiresAt)}
          </p>
        </div>

        <InvitationForm
          token={token}
          email={invitation.email}
          familyName={invitation.family.name}
        />
      </section>
    </main>
  );
}

function InvitationMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EDF1E7] p-4">
      <section className="w-full max-w-md rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5EBDD] text-3xl">
          !
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-[#19483D]">
          Zaproszenie niedostępne
        </h1>

        <p className="mt-3 leading-6 text-[#718078]">{message}</p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[#287969] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#19483D]"
        >
          Przejdź do logowania
        </Link>
      </section>
    </main>
  );
}
