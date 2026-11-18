import CalendarPageContent from "@/components/calendar/CalendarPageContent";
import { getCalendarEntries } from "./actions";
import { getFamilyContext } from "@/lib/auth/get-family-context";

export default async function CalendarPage() {
  const [initialEntries, context] = await Promise.all([
    getCalendarEntries(),
    getFamilyContext(),
  ]);

  const canManageEntries =
    context.authenticated &&
    context.hasFamily &&
    (context.memberRole === "HEAD" || context.memberRole === "ADULT");

  return (
    <CalendarPageContent
      initialEntries={initialEntries}
      canManageEntries={canManageEntries}
    />
  );
}
