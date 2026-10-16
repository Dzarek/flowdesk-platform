import Image from "next/image";
import Link from "next/link";
import { MdOutlineArrowForward, MdOutlineShoppingCart } from "react-icons/md";

type ShoppingItem = {
  id: number;
  name: string;
  quantity?: string;
  purchased: boolean;
};

type ShoppingWidgetProps = {
  items: ShoppingItem[];
};

export default function ShoppingWidget({ items }: ShoppingWidgetProps) {
  const activeItems = items.filter((item) => !item.purchased);
  const visibleItems = activeItems.slice(0, 4);
  const remainingItems = activeItems.length - visibleItems.length;

  return (
    <Link
      href="/shopping"
      className="
        group
        flex
        h-full
        flex-col
        rounded-3xl
        border
        border-border
        bg-card
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-lg
      "
    >
      {/* Header */}
      <div className="mb-6 px-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Lista zakupów</h2>

          <p className="text-sm text-muted-foreground">
            {activeItems.length > 0
              ? `${activeItems.length} produktów do kupienia`
              : "Lista jest pusta"}
          </p>
        </div>
        <Image
          src="/images/shop.svg"
          alt="shop"
          width={50}
          height={50}
          className="w-auto h-20"
        />
      </div>

      {/* Shopping items */}
      <div className="flex-1 space-y-2">
        {visibleItems.length === 0 ? (
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            Wszystko kupione 🎉
          </div>
        ) : (
          visibleItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-cardItem px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-4 w-4 shrink-0 rounded-full border-2 border-primary/60" />

                <span className="truncate font-medium">{item.name}</span>
              </div>

              {item.quantity && (
                <span className="ml-4 shrink-0 text-sm text-muted-foreground">
                  {item.quantity}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Remaining */}
      {remainingItems > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          + {remainingItems} kolejnych produktów
        </p>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
        Otwórz listę zakupów
        <MdOutlineArrowForward
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
