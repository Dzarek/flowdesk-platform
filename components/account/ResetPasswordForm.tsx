"use client";

import { useState } from "react";
import Link from "next/link";

import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { RiShieldKeyholeFill } from "react-icons/ri";

import { resetPassword } from "@/lib/actions/account";
import toast from "react-hot-toast";

type ResetPasswordFormProps = {
  token: string;
};
const PasswordField = ({
  id,
  label,
  value,
  onChange,
  visible,
  setVisible,
  loading,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
  loading: boolean;
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-2 block text-sm font-medium text-slate-700"
    >
      {label}
    </label>

    <div className="relative">
      <RiShieldKeyholeFill
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
        required
        minLength={8}
        className="
            w-full rounded-xl
            border border-slate-300
            bg-white
            px-11 py-3 pr-12
            text-sm text-slate-900
            outline-none
            transition
            focus:border-[#d39b27]
            focus:ring-2 focus:ring-[#d39b27]/20
            disabled:bg-slate-100
          "
      />

      <button
        type="button"
        onClick={() => setVisible(!visible)}
        disabled={loading}
        className="
            absolute right-3 top-1/2
            flex size-8
            -translate-y-1/2
            items-center justify-center
            rounded-lg
            text-slate-400
            hover:bg-slate-100
            hover:text-slate-700
          "
        aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
      >
        {visible ? <FaEyeSlash size={18} /> : <FaRegEye size={18} />}
      </button>
    </div>
  </div>
);

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      await resetPassword(token, password, confirmPassword);

      setSuccess(true);
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zmienić hasła.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FaCheck size={28} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Hasło zostało zmienione
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Możesz teraz zalogować się przy użyciu nowego hasła.
        </p>

        <Link
          href="/"
          className="
            mt-6 inline-flex
            rounded-xl
            bg-[#071b33]
            px-5 py-3
            text-sm font-semibold text-white
            transition hover:bg-[#102a46]
          "
        >
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Ustaw nowe hasło
        </h1>

        <p className="mt-2 text-base text-slate-500">
          Wprowadź nowe hasło do swojego konta
        </p>
      </div>
      <div className="space-y-5">
        <PasswordField
          id="password"
          label="Nowe hasło"
          value={password}
          onChange={setPassword}
          visible={showPassword}
          setVisible={setShowPassword}
          loading={loading}
        />

        <PasswordField
          id="confirmPassword"
          label="Powtórz nowe hasło"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirmPassword}
          setVisible={setShowConfirmPassword}
          loading={loading}
        />
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Hasło musi mieć co najmniej 8 znaków.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="
          mt-6 flex w-full
          items-center justify-center gap-2
          rounded-xl
          bg-[#071b33]
          px-5 py-3
          text-sm font-semibold text-white
          transition
          hover:bg-[#102a46]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <RiShieldKeyholeFill size={17} />

        {loading ? "Zapisywanie..." : "Ustaw nowe hasło"}
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
