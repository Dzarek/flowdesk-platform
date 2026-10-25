"use client";

import { useState } from "react";
import { FaMicrophone } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface VoiceFormProps {
  onAddProduct: (name: string) => void;
}

export default function VoiceForm({ onAddProduct }: VoiceFormProps) {
  const [message, setMessage] = useState("");

  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({
    commands: [
      {
        command: "*",
        callback: (spokenText: string) => {
          const product = spokenText.trim();

          if (product) {
            onAddProduct(product);
            setMessage(`Dodawanie: ${product}`);
          }
        },
      },
    ],
  });

  if (!browserSupportsSpeechRecognition) {
    return (
      <p className="text-sm text-[#839087]">
        Twoja przeglądarka nie obsługuje rozpoznawania mowy.
      </p>
    );
  }

  const handleClick = async () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setMessage("Zakończono nagrywanie.");
      return;
    }

    try {
      setMessage("Uruchamiam mikrofon...");

      await SpeechRecognition.startListening({
        continuous: true,
        language: "pl-PL",
      });

      setMessage("Słucham… Powiedz nazwę produktu.");
    } catch {
      setMessage("Nie udało się uruchomić mikrofonu.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#F5F6EE] p-4">
      <button
        type="button"
        onClick={() => void handleClick()}
        aria-label={
          listening ? "Zatrzymaj nagrywanie" : "Dodaj produkt głosowo"
        }
        className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl transition ${
          listening
            ? "animate-pulse bg-[#19483D] text-white"
            : "bg-[#287969] text-white hover:bg-[#19483D]"
        }`}
      >
        <FaMicrophone size={19} />
      </button>

      <div className="">
        <p className="text-sm font-semibold text-[#263C35]">
          {listening ? "Słucham Twojego głosu" : "Dodaj głosowo"}
        </p>
        {/* <p aria-live="polite" className="mt-1 text-xs text-[#839087]">
          {message || "Naciśnij mikrofon i wypowiedz nazwę produktu."}
        </p> */}
      </div>
    </div>
  );
}
