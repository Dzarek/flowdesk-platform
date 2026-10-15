"use client";

import { useState } from "react";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { RiShieldKeyholeFill } from "react-icons/ri";
import { changePassword } from "@/lib/actions/account";
import toast from "react-hot-toast";

function PasswordInput({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="
            w-full rounded-xl
            border border-slate-300
            bg-white
            px-4 py-3 pr-12
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
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
          className="
            absolute right-3 top-1/2
            flex size-8
            -translate-y-1/2
            items-center justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-700
          "
        >
          {visible ? <FaEyeSlash size={18} /> : <FaRegEye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      await changePassword(currentPassword, newPassword, confirmPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Hasło zostało pomyślnie zmienione.");
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zmienić hasła.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <PasswordInput
          id="currentPassword"
          label="Aktualne hasło"
          value={currentPassword}
          onChange={setCurrentPassword}
          disabled={loading}
        />

        <PasswordInput
          id="newPassword"
          label="Nowe hasło"
          value={newPassword}
          onChange={setNewPassword}
          disabled={loading}
        />

        <PasswordInput
          id="confirmPassword"
          label="Powtórz nowe hasło"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={loading}
        />
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Hasło powinno mieć co najmniej 8 znaków.
      </p>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="
            flex items-center gap-2
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

          {loading ? "Zapisywanie..." : "Zmień hasło"}
        </button>
      </div>
    </form>
  );
}
