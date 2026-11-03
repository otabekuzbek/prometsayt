import Link from "next/link";

export default function PageHero({ title, text, crumb, script }: { title: string; text?: string; crumb: { href?: string; label: string }[]; script?: string }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        <nav className="crumbs" aria-label="Yo'l">
          <Link href="/">Bosh sahifa</Link>
          {crumb.map((c) => (
            <span key={c.label} style={{ display: "contents" }}>
              <span aria-hidden="true">/</span>
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
        {script && <span className="script">{script}</span>}
        <h1 className="h-lg">{title}</h1>
        {text && <p className="lead">{text}</p>}
      </div>
    </section>
  );
}
