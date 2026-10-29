"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MdOutlineAutoAwesome } from "react-icons/md";

type DashboardHeroProps = {
  data: {
    user: {
      firstName: string;
    };
    ai: {
      text: string;
    };
  };
};

export default function DashboardHero({ data }: DashboardHeroProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleSpeech = () => {
    if (!isSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(data.ai.text);
    const polishVoices = window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang === "pl-PL");

    utterance.voice = polishVoices[2] ?? polishVoices[0] ?? null;
    utterance.lang = "pl-PL";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex min-w-0 flex-col max-h-[300px]">
      <section className="px-4 py-2">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-[var(--greenText)]">
          Dzień dobry, {data.user.firstName}! <span>👋</span>
        </h1>
      </section>

      <div className="flex flex-1 relative w-full overflow-hidden flex-col rounded-4xl border-2 border-[var(--greenText)] bg-[#FEFEFA] pl-6 pr-3 py-5 text-[var(--greenText)] shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <MdOutlineAutoAwesome className="text-2xl" />
          Podsumowanie AI
        </div>

        <div className="flex items-start w-full gap-3 overflow-y-auto overflow-x-hidden">
          <p className="min-w-0 w-[80%]  leading-7 text-muted-foreground">
            {data.ai.text}
          </p>

          <button
            type="button"
            onClick={handleSpeech}
            disabled={!isSupported}
            aria-label={
              isSpeaking ? "Zatrzymaj robota" : "Posłuchaj podsumowania"
            }
            title={isSpeaking ? "Zatrzymaj odczyt" : "Odczytaj podsumowanie"}
            className="absolute right-5 top-12 flex flex-col w-1/6 shrink-0 items-center justify-center rounded-2xl outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--greenText)] disabled:opacity-40 sm:w-30"
          >
            {isSpeaking && (
              <div className="sound-wave sound-wave-left" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            )}

            <div
              key={isSpeaking ? "speaking" : "idle"}
              className="ai-image-enter relative z-10 w-full"
            >
              <Image
                src={isSpeaking ? "/images/ai1.png" : "/images/ai2.png"}
                alt={isSpeaking ? "AI mówi" : "AI w spoczynku"}
                width={160}
                height={180}
                className="h-auto w-full cursor-pointer object-contain"
                priority
              />
            </div>
            <span className="text-[9px]">
              {isSpeaking ? "kliknij aby zatrzymać" : "kliknij aby odsłuchać"}
            </span>
            {isSpeaking && (
              <div className="sound-wave sound-wave-right" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
