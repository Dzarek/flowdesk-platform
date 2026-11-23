import SchedulePageContent from "@/components/schedule/SchedulePageContent";
import { getFamilyContext } from "@/lib/auth/get-family-context";
import { getScheduleEntries } from "./actions";

export default async function HarmonogramPage() {
  const [context, schedule] = await Promise.all([
    getFamilyContext(),
    getScheduleEntries(),
  ]);

  const canManageSchedule =
    context.authenticated &&
    context.hasFamily &&
    (context.memberRole === "HEAD" || context.memberRole === "ADULT");

  const entries = schedule.success ? schedule.entries : [];

  const initialEntries = entries.map(({ notes, ...entry }) => ({
    ...entry,
    dayOfWeek: entry.dayOfWeek ?? null,
  }));

  const initialNotes = entries.flatMap((entry) => entry.notes);

  return (
    <SchedulePageContent
      canManageSchedule={canManageSchedule}
      initialEntries={initialEntries}
      initialNotes={initialNotes}
      initialMembers={schedule.success ? schedule.members : []}
    />
  );
}
