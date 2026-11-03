import { getLeads } from "@/lib/store";
import LeadsTable from "@/components/admin/LeadsTable";

export default async function Page() {
  const leads = await getLeads(1000);
  return <LeadsTable initial={JSON.parse(JSON.stringify(leads))} />;
}
