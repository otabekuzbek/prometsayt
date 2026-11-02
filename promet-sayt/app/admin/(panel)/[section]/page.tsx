import { notFound } from "next/navigation";
import { SECTIONS } from "@/lib/admin-schema";
import { getContent, getPrivate } from "@/lib/store";
import CollectionEditor from "@/components/admin/CollectionEditor";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const schema = SECTIONS.find((s) => s.key === section);
  if (!schema) notFound();
  const items =
    schema.store === "warranties"
      ? (await getPrivate()).warranties
      : ((await getContent()) as unknown as Record<string, unknown[]>)[schema.store];
  return <CollectionEditor key={section} sectionKey={section} initial={JSON.parse(JSON.stringify(items))} />;
}
