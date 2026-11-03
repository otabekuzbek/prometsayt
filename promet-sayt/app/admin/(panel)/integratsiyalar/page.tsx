import { getPrivate } from "@/lib/store";
import { INTEGRATION_GROUPS } from "@/lib/admin-schema";
import { resolveIntegrations } from "@/lib/crm";
import GroupEditor from "@/components/admin/GroupEditor";
import IntegrationTest from "@/components/admin/IntegrationTest";
import { saveIntegrations } from "../../actions";

export default async function Page() {
  let p;
  try {
    p = await getPrivate();
  } catch {
    return <div className="adm-error">Maxfiy ma&apos;lumotlarni ochib bo&apos;lmadi. AUTH_SECRET o&apos;zgartirilgan bo&apos;lishi mumkin — avvalgi qiymatini qaytaring.</div>;
  }
  const saved = p.integrations as unknown as Record<string, string>;
  const env = resolveIntegrations(p.integrations) as unknown as Record<string, string>;
  // Maxfiy qiymatlar brauzerga yuborilmaydi — faqat «saqlangan» belgisi
  const initial: Record<string, string> = {};
  for (const f of INTEGRATION_GROUPS.flatMap((g) => g.fields)) {
    initial[f.key] = f.type === "secret" ? (saved[f.key] ? "__set__" : "") : saved[f.key] || "";
  }
  const fromEnv = INTEGRATION_GROUPS.flatMap((g) => g.fields).filter((f) => !saved[f.key] && env[f.key]).map((f) => f.label);
  return (
    <GroupEditor
      title="Integratsiyalar"
      intro="Saytdan kelgan har bir murojaat shu yerda ulangan tizimlarga avtomatik yuboriladi"
      groups={INTEGRATION_GROUPS}
      initial={initial}
      onSave={saveIntegrations}
      extra={
        <>
          {fromEnv.length > 0 && <div className="adm-warn">Vercel muhit o&apos;zgaruvchilaridan olinmoqda: {fromEnv.join(", ")}</div>}
          <IntegrationTest />
        </>
      }
    />
  );
}
