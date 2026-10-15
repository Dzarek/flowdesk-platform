"use client";

import { useState } from "react";
import { FaSave } from "react-icons/fa";

import { updateUserName } from "@/lib/actions/account";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type ChangeNameFormProps = {
  currentName: string;
};

export default function ChangeNameForm({ currentName }: ChangeNameFormProps) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);
      await updateUserName(name);
      toast.success("Nazwa użytkownika została zmieniona.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się zmienić nazwy użytkownika");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Nazwa użytkownika
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={50}
          disabled={loading}
          className="
            w-full rounded-xl
            border border-slate-300
            bg-white px-4 py-3
            text-sm text-slate-900
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-[#d39b27]
            focus:ring-2 focus:ring-[#d39b27]/20
            disabled:bg-slate-100
          "
          placeholder="Twoja nazwa"
        />
      </div>

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
          <FaSave size={17} />

          {loading ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </div>
    </form>
  );
}
