"use client";

import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  FiShoppingCart,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiLoader,
} from "react-icons/fi";

import QuickAddGrid from "@/components/shopping/QuickAddGrid";
import { useShoppingList } from "@/lib/shopping/useShoppingList";
import VoiceForm from "./VoiceForm";
import Image from "next/image";
import { FiRefreshCw } from "react-icons/fi";

export default function ShoppingPageContent() {
  const {
    products,
    loading,
    error,
    addProduct,
    toggleProductStatus,
    deleteProduct,
    clearList,
    refresh,
  } = useShoppingList();

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const pendingProducts = products
    .filter((product) => !product.completed)
    .reverse();
  const completedProducts = products.filter((product) => product.completed);

  async function handleAddProduct(
    productName: string,
    category: "spożywcze" | "chemia" | "inne" = "inne",
  ) {
    if (!productName.trim()) return;

    try {
      setAdding(true);
      await addProduct(productName, category);
      toast.success(`Dodano: ${productName}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się dodać produktu.",
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) return;

    const productName = name.trim();

    try {
      await handleAddProduct(productName);
      setName("");
    } catch {
      // Błąd jest już obsługiwany w handleAddProduct.
    }
  }

  async function handleToggle(id: string, completed: boolean) {
    try {
      await toggleProductStatus(id, completed);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się zmienić statusu.",
      );
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      toast.success("Usunięto produkt.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się usunąć produktu.",
      );
    }
  }

  async function handleClearList() {
    if (products.length === 0) return;

    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć wszystkie produkty z listy zakupów?",
    );

    if (!confirmed) return;

    try {
      setClearing(true);
      await clearList();
      toast.success("Lista zakupów została wyczyszczona.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się wyczyścić listy.",
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6 text-[#263C35]">
      <Toaster position="top-right" />

      {/* Nagłówek */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#E2F0EB]" />

        <div className="relative flex h-[230px] flex-col justify-center gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative z-10 max-w-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#287969] text-white">
              <FiShoppingCart size={24} />
            </div>

            <p className="mb-2 text-sm font-semibold text-[#287969]">
              Domowe zapasy
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Lista zakupów
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#839087]">
              Wszystko, czego potrzebuje Twoja rodzina — w jednym miejscu.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <span className="rounded-xl bg-white/80 px-3 py-2">
                Do kupienia: <strong>{pendingProducts.length}</strong>
              </span>
              <span className="rounded-xl bg-white/80 px-3 py-2">
                Kupione: <strong>{completedProducts.length}</strong>
              </span>
            </div>
          </div>

          <Image
            src="/images/shoppingHeader.svg"
            alt="schedule"
            width={300}
            height={300}
            className="h-full object-contain"
          />
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Lista produktów */}
        <section className="rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Twoja lista</h2>
              <p className="mt-1 text-sm text-[#839087]">
                {pendingProducts.length} produktów do kupienia
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              aria-label="Odśwież listę zakupów"
              className="cursor-pointer rounded-xl border border-[#DCE4D9] p-3 text-[#287969] transition hover:bg-[#E2F0EB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw size={18} />
            </button>
            <button
              type="button"
              onClick={handleClearList}
              disabled={clearing || products.length === 0}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DCE4D9] px-3 py-2 text-sm text-[#839087] transition hover:bg-[#F5F6EE] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearing ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
              <span className="hidden sm:inline">Wyczyść</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#839087]">
              <FiLoader className="animate-spin" />
              Ładowanie listy...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-[#F5F6EE] px-4 py-12 text-center">
              <FiShoppingCart
                className="mx-auto mb-3 text-[#287969]"
                size={32}
              />
              <p className="font-semibold">Lista jest pusta</p>
              <p className="mt-1 text-sm text-[#839087]">
                Dodaj pierwszy produkt z formularza lub szybkiego dodawania.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#DCE4D9] p-3 transition hover:bg-[#F5F6EE]/70"
                >
                  <button
                    type="button"
                    aria-label={`Oznacz ${product.name} jako kupione`}
                    onClick={() =>
                      void handleToggle(product.id, product.completed)
                    }
                    className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-[#B8C8BA] text-white transition hover:border-[#287969] hover:bg-[#E2F0EB]"
                  />

                  <span className="min-w-0 flex-1 break-words text-sm font-medium">
                    {product.name}
                  </span>

                  <button
                    type="button"
                    aria-label={`Usuń ${product.name}`}
                    onClick={() => void handleDelete(product.id)}
                    className="cursor-pointer rounded-lg p-2 text-[#839087] transition hover:bg-red-50 hover:text-red-600"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}

              {completedProducts.length > 0 && (
                <div className="pt-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#839087]">
                    Kupione ({completedProducts.length})
                  </h3>

                  <div className="space-y-2">
                    {completedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 rounded-2xl bg-[#F5F6EE] p-3"
                      >
                        <button
                          type="button"
                          aria-label={`Przywróć ${product.name} na listę`}
                          onClick={() =>
                            void handleToggle(product.id, product.completed)
                          }
                          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#287969] text-white"
                        >
                          <FiCheck size={15} />
                        </button>

                        <span className="min-w-0 flex-1 break-words text-sm text-[#839087] line-through">
                          {product.name}
                        </span>

                        <button
                          type="button"
                          aria-label={`Usuń ${product.name}`}
                          onClick={() => void handleDelete(product.id)}
                          className="cursor-pointer rounded-lg p-2 text-[#839087] transition hover:bg-red-50 hover:text-red-600"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Dodawanie produktów */}
        <div className="space-y-6">
          <div className="flex items-strech justify-between gap-2">
            <section className="flex-1 rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-bold">Dodaj produkt</h2>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Np. mleko, chleb, jabłka..."
                  maxLength={120}
                  className="min-w-0 flex-1 rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />

                <button
                  type="submit"
                  disabled={!name.trim() || adding}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#287969] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#19483D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiPlus size={18} />
                  <span className="hidden sm:inline">Dodaj</span>
                </button>
              </form>
            </section>
            <VoiceForm
              onAddProduct={(productName) => {
                void handleAddProduct(productName, "inne");
              }}
            />
          </div>
          <section>
            <div className="mb-3">
              <h2 className="text-lg font-bold">Szybkie dodawanie</h2>
              <p className="mt-1 text-sm text-[#839087]">
                Wybierz produkt, aby dodać go do listy.
              </p>
            </div>

            <QuickAddGrid
              onAddProduct={(productName, category) => {
                void handleAddProduct(productName, category);
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
