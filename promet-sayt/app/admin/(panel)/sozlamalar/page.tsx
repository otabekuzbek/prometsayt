import { getContent } from "@/lib/store";
import SettingsEditor from "@/components/admin/SettingsEditor";

export default async function Page() {
  const c = await getContent();
  return <SettingsEditor settings={JSON.parse(JSON.stringify(c.settings))} pricing={JSON.parse(JSON.stringify(c.pricing))} />;
}
