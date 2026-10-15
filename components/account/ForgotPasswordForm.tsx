"use client";

import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdMail, MdSend } from "react-icons/md";

import Link from "next/link";

import { requestPasswordReset } from "@/lib/actions/account";
import toast from "react-hot-toast";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      await requestPasswordReset(email);

      setSent(true);
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się wysłać wiadomości.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-[#d39b27] bg-[#d39b27]/10 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#d39b27]/20 text-[#d39b27]">
          <MdMail size={22} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Sprawdź swoją skrzynkę
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Jeśli konto z podanym adresem istnieje, wysłaliśmy wiadomość z
          instrukcją zmiany hasła.
        </p>

        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#071b33] hover:text-[#d39b27]"
        >
          <FaArrowLeft size={16} />
          Wróć do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Resetowanie hasła
        </h1>

        <p className="mt-2 text-base text-slate-500">
          Podaj adres e-mail powiązany z Twoim kontem.
        </p>
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Adres e-mail
        </label>

        <div className="relative">
          <MdMail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            placeholder="twoj@email.pl"
            required
            className="
              w-full rounded-xl
              border border-slate-300
              bg-white
              px-4 py-3 pl-11
              text-sm text-slate-900
              outline-none
              transition
              focus:border-[#d39b27]
              focus:ring-2 focus:ring-[#d39b27]/20
              disabled:bg-slate-100
            "
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          mt-5 flex w-full
          items-center justify-center gap-2
          rounded-xl
          bg-[#071b33]
          px-5 py-3
          text-sm font-semibold text-white
          transition
          hover:bg-[#102a46]
          disabled:cursor-not-allowed
          disabled:opacity-50
          cursor-pointer
        "
      >
        <MdSend size={17} />

        {loading ? "Wysyłanie..." : "Wyślij link do resetowania"}
      </button>

      <Link
        href="/"
        className="
          mt-4 flex items-center justify-center gap-2
          text-sm font-medium text-zinc-500
          transition hover:text-[#d39b27]
        "
      >
        <FaArrowLeft size={16} />
        Wróć do logowania
      </Link>
    </form>
  );
}
