"use client";

import { useActionState } from "react";

import { createFamily, type CreateFamilyState } from "./actions";

const initialState: CreateFamilyState = {};

export default function CreateFamilyPage() {
  const [state, formAction, isPending] = useActionState(
    createFamily,
    initialState,
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EDF1E7] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-[#FEFEFA] p-7 sm:p-9 shadow-sm">
        <div className="mb-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E2F0EB]">
            <span className="text-2xl">🏡</span>
          </div>

          <p className="mb-2 text-sm font-semibold text-[#287969]">
            Witaj w LifeHub!
          </p>

          <h1 className="text-2xl font-bold text-[#263C35]">
            Utwórz swoją rodzinę
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#839087]">
            Stwórz wspólną przestrzeń dla swojej rodziny. Będziesz jej
            administratorem i otrzymasz rolę HEAD.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="familyName"
              className="mb-2 block text-sm font-semibold text-[#263C35]"
            >
              Nazwa rodziny
            </label>

            <input
              id="familyName"
              name="name"
              type="text"
              placeholder="np. Kowalscy"
              minLength={2}
              maxLength={60}
              required
              disabled={isPending}
              className="w-full rounded-xl border border-[#DCE4D9] bg-[#F5F6EE] px-4 py-3 text-sm text-[#263C35] outline-none transition placeholder:text-[#A0AAA1] focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10 disabled:cursor-not-allowed"
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#287969] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#19483D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Tworzenie rodziny..." : "Utwórz rodzinę"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-[#839087]">
          Po utworzeniu rodziny będziesz mógł zapraszać dorosłych i dodawać
          profile dzieci.
        </p>
      </div>
    </main>
  );
}
