import { getContent } from "@/lib/store";
import { HOME_GROUPS } from "@/lib/admin-schema";
import GroupEditor from "@/components/admin/GroupEditor";
import { saveObject } from "../../actions";

export default async function Page() {
  const c = await getContent();
  return (
    <GroupEditor
      title="Bosh sahifa"
      intro="Birinchi ekran (3D model, rasm yoki video), har bir bo'lim matni va ko'rinishi"
      groups={HOME_GROUPS}
      initial={JSON.parse(JSON.stringify(c.home))}
      onSave={saveObject.bind(null, "home")}
      viewHref="/"
    />
  );
}
