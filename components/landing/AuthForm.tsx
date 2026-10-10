"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

import toast from "react-hot-toast";
import Link from "next/link";
import { FaArrowRight, FaUser, FaUserPlus, FaDoorOpen } from "react-icons/fa";
import { BsFillShieldLockFill, BsShieldFillExclamation } from "react-icons/bs";
import { LuLoaderCircle } from "react-icons/lu";

import { MdEmail } from "react-icons/md";
import { BiSolidKey } from "react-icons/bi";

type AuthMode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isRegister) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Uzupełnij adres e-mail i hasło.");

      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        toast.error("Nieprawidłowy adres e-mail lub hasło.");

        setPassword("");
        return;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);

      toast.error("Wystąpił błąd podczas logowania.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error("Podaj swoje imię.");
      return;
    }

    if (!email.trim()) {
      toast.error("Podaj adres e-mail.");
      return;
    }

    if (password.length < 8) {
      toast.error("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Hasła nie są takie same.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Nie udało się utworzyć konta.");

        return;
      }

      toast.success("Konto zostało utworzone. Możesz się zalogować.");

      setMode("login");

      setName("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);

      toast.error("Wystąpił błąd podczas rejestracji.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[28px] p-5 xl:p-7 border border-white/70 bg-[#f3f2e9]/85 shadow-[0_20px_70px_-25px_rgba(36,76,59,0.22)] backdrop-blur-xl authFormPadding">
      <div>
        <div className="flex flex-col lg:flex-row items-center gap-5 text-center lg:text-left">
          <div className="flex size-14 items-center justify-center rounded-2xl text-[#244C3B]">
            {isRegister ? <FaUserPlus size={40} /> : <FaDoorOpen size={50} />}
          </div>
          <div>
            <h2 className="text-2xl font-semibold  text-zinc-900">
              {isRegister ? "Utwórz konto" : "Witaj ponownie!"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {isRegister
                ? "Załóż konto i zacznij organizować codzienność swojej rodziny."
                : "Zaloguj się, aby wrócić do swojej domowej przestrzeni."}
            </p>
          </div>
        </div>
      </div>
      {/* =====================================================
          FORMULARZ
      ====================================================== */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* IMIĘ — tylko rejestracja */}

        {isRegister && (
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[#34473A]"
            >
              Imię
            </label>

            <div className="relative">
              <FaUser
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jan"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#244C3B]/15 bg-[#F5F0E7]/55 pl-11 pr-4 text-sm text-[#29372E] outline-none transition placeholder:text-[#A39B8D] focus:border-[#56775D] focus:bg-white focus:ring-4 focus:ring-[#56775D]/10"
              />
            </div>
          </div>
        )}

        {/* EMAIL */}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[#34473A]"
          >
            Adres e-mail
          </label>

          <div className="relative">
            <MdEmail
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jan@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#244C3B]/15 bg-[#F5F0E7]/55 pl-11 pr-4 text-sm text-[#29372E] outline-none transition placeholder:text-[#A39B8D] focus:border-[#56775D] focus:bg-white focus:ring-4 focus:ring-[#56775D]/10"
            />
          </div>
        </div>

        {/* HASŁO */}
        <div className="groupInputAuth w-full">
          <div className="w-full">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#34473A]"
            >
              Hasło
            </label>

            <div className="relative w-full">
              <BsFillShieldLockFill
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                id="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#244C3B]/15 bg-[#F5F0E7]/55 pl-11 pr-4 text-sm text-[#29372E] outline-none transition placeholder:text-[#A39B8D] focus:border-[#56775D] focus:bg-white focus:ring-4 focus:ring-[#56775D]/10"
              />
            </div>

            {isRegister && (
              <p className="mt-2 text-xs text-zinc-400">Minimum 8 znaków.</p>
            )}
          </div>

          {/* POWTÓRZ HASŁO */}

          {isRegister && (
            <div className="w-full">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Powtórz hasło
              </label>

              <div className="relative w-full">
                <BsShieldFillExclamation
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#244C3B]/15 bg-[#F5F0E7]/55 pl-11 pr-4 text-sm text-[#29372E] outline-none transition placeholder:text-[#A39B8D] focus:border-[#56775D] focus:bg-white focus:ring-4 focus:ring-[#56775D]/10"
                />
              </div>
            </div>
          )}
        </div>
        {!isRegister && (
          <div className="mt-2 flex justify-end">
            <Link
              href="/reset-hasla"
              className="text-sm font-medium text-[#77766C] transition hover:text-[#C47B5A]"
            >
              Nie pamiętasz hasła?
            </Link>
          </div>
        )}
        {/* SUBMIT */}

        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#244C3B] px-4 text-sm font-semibold text-[#FFFEFA] shadow-lg shadow-[#244C3B]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#315B46] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <LuLoaderCircle size={18} className="animate-spin" />

              {isRegister ? "Tworzenie konta..." : "Logowanie..."}
            </>
          ) : (
            <>
              {isRegister ? "Utwórz konto" : "Zaloguj się"}

              <FaArrowRight size={17} />
            </>
          )}
        </button>
      </form>
      {/* =====================================================
          PRZEŁĄCZANIE TRYBU
      ====================================================== */}
      <div className="mt-7 border-t border-[#244C3B]/10 pt-6 text-center">
        <p className="text-sm text-[#77766C]">
          {isRegister ? "Masz już konto?" : "Nie masz jeszcze konta?"}
        </p>

        <button
          type="button"
          onClick={switchMode}
          className="mt-1 cursor-pointer text-sm font-semibold text-[#C47B5A] transition hover:text-[#A85F42]"
        >
          {isRegister ? "Zaloguj się" : "Zarejestruj się"}
        </button>
      </div>
    </div>
  );
}
