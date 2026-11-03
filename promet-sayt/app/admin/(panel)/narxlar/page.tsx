import { getContent } from "@/lib/store";
import { PRICING_GROUPS } from "@/lib/admin-schema";
import GroupEditor from "@/components/admin/GroupEditor";
import { saveObject } from "../../actions";

export default async function Page() {
  const c = await getContent();
  return (
    <GroupEditor
      title="Kalkulyator narxlari"
      intro="Mahsulotlarning o'z narxi «Mahsulotlar» bo'limida o'zgartiriladi"
      groups={PRICING_GROUPS}
      initial={JSON.parse(JSON.stringify(c.pricing))}
      onSave={saveObject.bind(null, "pricing")}
      viewHref="/kalkulyator"
    />
  );
}
