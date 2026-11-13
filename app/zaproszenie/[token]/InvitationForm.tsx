"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { acceptInvitation, registerAndAcceptInvitation } from "./actions";

type InvitationFormProps = {
  token: string;
  email: string;
  familyName: string;
};

type FormMode = "REGISTER" | "LOGIN";

export default function InvitationForm({
  token,
  email,
  familyName,
}: InvitationFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<FormMode>("REGISTER");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Podane hasła nie są identyczne.");
      return;
    }

    startTransition(async () => {
      const result = await registerAndAcceptInvitation(
        token,
        name,
        password,
        confirmPassword,
      );

      if (!result.success) {
        setError(result.error ?? "Nie udało się utworzyć konta.");
        return;
      }

      // Konto zostało już utworzone i przypisane do rodziny.
      // Teraz logujemy nowego użytkownika.
      const loginResult = await signIn("credentials", {
        email: result.email ?? email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setError(
          "Konto zostało utworzone i dołączyło do rodziny, ale logowanie nie powiodło się. Przejdź do strony logowania.",
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    });
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setError("Nieprawidłowy adres e-mail lub hasło.");
        return;
      }

      const result = await acceptInvitation(token);

      if (!result.success) {
        setError(result.error ?? "Nie udało się zaakceptować zaproszenia.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    });
  }

  function changeMode(nextMode: FormMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="mt-7">
      <div className="grid grid-cols-2 rounded-xl bg-[#F5F6EE] p-1">
        <button
          type="button"
          onClick={() => changeMode("REGISTER")}
          className={`cursor-pointer rounded-lg px-3 py-3 text-sm font-semibold transition ${
            mode === "REGISTER"
              ? "bg-white text-[#287969] shadow-sm"
              : "text-[#839087] hover:text-[#263C35]"
          }`}
        >
          Nowe konto
        </button>

        <button
          type="button"
          onClick={() => changeMode("LOGIN")}
          className={`cursor-pointer rounded-lg px-3 py-3 text-sm font-semibold transition ${
            mode === "LOGIN"
              ? "bg-white text-[#287969] shadow-sm"
              : "text-[#839087] hover:text-[#263C35]"
          }`}
        >
          Mam już konto
        </button>
      </div>

      <form
        onSubmit={mode === "REGISTER" ? handleRegister : handleLogin}
        className="mt-6 space-y-4"
      >
        <div>
          <label
            htmlFor="invitation-email"
            className="mb-2 block text-sm font-semibold text-[#38544A]"
          >
            Adres e-mail
          </label>

          <input
            id="invitation-email"
            type="email"
            value={email}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-[#DCE4D9] bg-[#F5F6EE] px-4 py-3 text-[#839087] outline-none"
          />
        </div>

        {mode === "REGISTER" && (
          <div>
            <label
              htmlFor="invitation-name"
              className="mb-2 block text-sm font-semibold text-[#38544A]"
            >
              Imię i nazwisko
            </label>

            <input
              id="invitation-name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Np. Anna Kowalska"
              className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="invitation-password"
            className="mb-2 block text-sm font-semibold text-[#38544A]"
          >
            Hasło
          </label>

          <input
            id="invitation-password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete={
              mode === "REGISTER" ? "new-password" : "current-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 znaków"
            className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
          />
        </div>

        {mode === "REGISTER" && (
          <div>
            <label
              htmlFor="invitation-confirm-password"
              className="mb-2 block text-sm font-semibold text-[#38544A]"
            >
              Powtórz hasło
            </label>

            <input
              id="invitation-confirm-password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Wpisz ponownie hasło"
              className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
            />
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#287969] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#19483D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Przetwarzanie..."
            : mode === "REGISTER"
              ? "Utwórz konto i dołącz"
              : "Zaloguj się i dołącz"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-[#839087]">
        Dołączasz do rodziny <strong>{familyName}</strong>. Po akceptacji
        uzyskasz dostęp do wspólnych danych rodzinnych.
      </p>
    </div>
  );
}
