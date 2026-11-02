import { getLeads } from "@/lib/store";

export default async function Page() {
  const leads = await getLeads(300);
  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <div><h1>Murojaatlar</h1><span className="adm-help">Saytdagi formalar va kalkulyatordan kelgan so&apos;nggi {leads.length} ta murojaat. amoCRM va Telegram ulangan bo&apos;lsa, ular u yerga ham boradi.</span></div>
      </div>
      {leads.length === 0 ? (
        <div className="adm-empty">Hali murojaat yo&apos;q.</div>
      ) : (
        <div className="adm-card" style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr><th>Sana</th><th>Ism</th><th>Telefon</th><th>Hudud</th><th>Kim</th><th>Qachon</th><th>Manba</th><th>Izoh / hisob</th></tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(l.createdAt).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })}</td>
                  <td><b>{l.name || "—"}</b></td>
                  <td style={{ whiteSpace: "nowrap" }}><a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}>{l.phone}</a></td>
                  <td>{l.region}</td>
                  <td>{l.role}</td>
                  <td>{l.timeline}</td>
                  <td>{l.source}{l.utm && <div className="adm-help">{l.utm}</div>}</td>
                  <td style={{ whiteSpace: "pre-line", minWidth: 240 }}>{[l.comment, l.calc].filter(Boolean).join("\n\n")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
