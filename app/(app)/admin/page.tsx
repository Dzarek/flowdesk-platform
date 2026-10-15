import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOptions";

const Backup = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <div className="px-4 py-10 xl:px-10">ADMIN PANEL</div>;
};

export default Backup;
