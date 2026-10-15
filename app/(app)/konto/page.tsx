import { redirect } from "next/navigation";
import { MdMail, MdShield } from "react-icons/md";
import { FaUser } from "react-icons/fa";

import ChangeNameForm from "@/components/account/ChangeNameForm";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <main className="py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-4xl px-4 xl:px-0">
        {/* Header */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Moje konto
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Zarządzaj swoimi danymi i ustawieniami bezpieczeństwa.
          </p>
        </div>

        <div className="space-y-6">
          {/* Dane konta */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#d39b27]/5 text-[#d39b27]">
                <FaUser size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">Dane konta</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Zmień nazwę wyświetlaną na Twoim koncie.
                </p>
              </div>
            </div>

            <ChangeNameForm currentName={user.name ?? ""} />

            <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#d39b27]/5 px-4 py-3">
              <MdMail size={22} className="shrink-0 text-zinc-400" />

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-zinc-600">
                  {user.email}
                </p>
              </div>
            </div>
          </section>

          {/* Bezpieczeństwo */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <MdShield size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bezpieczeństwo
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Zmień hasło zabezpieczające Twoje konto.
                </p>
              </div>
            </div>

            <ChangePasswordForm />
          </section>
        </div>
      </div>
    </main>
  );
}
