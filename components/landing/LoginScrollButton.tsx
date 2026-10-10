"use client";

export default function LoginScrollButton() {
  function handleClick() {
    document.getElementById("logowanie")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mx-auto mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[#d39b27] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#222222]/15 transition hover:bg-[#bd8920] lg:hidden"
    >
      Zaloguj się
    </button>
  );
}
