import { getContent } from "@/lib/store";
import { SETTINGS_GROUPS } from "@/lib/admin-schema";
import GroupEditor from "@/components/admin/GroupEditor";
import { saveObject } from "../../actions";

export default async function Page() {
  const c = await getContent();
  return (
    <GroupEditor
      title="Sozlamalar"
      intro="Aloqa ma'lumotlari, ijtimoiy tarmoqlar, SEO va analitika"
      groups={SETTINGS_GROUPS}
      initial={JSON.parse(JSON.stringify(c.settings))}
      onSave={saveObject.bind(null, "settings")}
      viewHref="/aloqa"
    />
  );
}
