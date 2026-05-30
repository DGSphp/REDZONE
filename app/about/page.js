import Link from "next/link";

export const metadata = {
  title: "About Red Zone — Period Tracker for Couples",
  description: "Red Zone was built for partners who want to actually understand the menstrual cycle — not just tolerate it. Learn about our mission and how the app works.",
  alternates: {
    canonical: "https://redzonecouple.site/about",
  },
  openGraph: {
    title: "About Red Zone — Period Tracker for Couples",
    description: "Red Zone was built for partners who want to actually understand the menstrual cycle — not just tolerate it.",
    url: "https://redzonecouple.site/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="container">
      {/* Nav */}
      <div style={{ marginBottom: "2.5rem" }}>
        <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Back to Red Zone
        </Link>
      </div>

      {/* Hero */}
      <header style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 3rem)", marginBottom: "1rem", lineHeight: 1.2 }}>
          Built for the Partner Who Wants to Help
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#94a3b8", lineHeight: 1.7, maxWidth: "640px" }}>
          Red Zone exists because most period tracker apps are built for one person. We built one for two.
        </p>
      </header>

      {/* Mission */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>Our Mission</h2>
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <p style={{ color: "#cbd5e1", lineHeight: 1.8, margin: "0 0 1rem" }}>
            Menstrual cycles affect mood, energy, intimacy, and how people experience stress — yet most partners
            navigate this without any real information. The result is confusion, conflict, and missed opportunities
            to connect.
          </p>
          <p style={{ color: "#cbd5e1", lineHeight: 1.8, margin: 0 }}>
            Red Zone gives partners visibility into the cycle — not to control it, but to understand it. When you
            know what phase she's in, you stop taking things personally and start showing up the right way.
          </p>
        </div>
      </section>

      {/* How it was built */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {[
            { icon: "📅", title: "Cycle Tracking", desc: "Enter the last period date and cycle length. Red Zone calculates phases automatically." },
            { icon: "🤖", title: "Telegram Bot", desc: "Ask the bot for the current status anytime. Get the phase, mood forecast, and advice on demand." },
            { icon: "🔴", title: "Context Zone Alerts", desc: "Automated alerts before the most difficult days of the cycle so you can prepare." },
            { icon: "📊", title: "Daily Briefing", desc: "Members receive a morning Telegram message with the day's phase, mood, and advice." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="glass-panel" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
              <h3 style={{ fontSize: "0.95rem", marginBottom: "0.4rem" }}>{title}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>What We Believe</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { title: "Privacy first", desc: "Your cycle data is stored securely and never sold or shared with third parties." },
            { title: "No shame, no stigma", desc: "We treat the menstrual cycle as a normal biological reality — not something to hide or be embarrassed about." },
            { title: "Partnership, not surveillance", desc: "Red Zone is a tool for support, not control. Awareness should bring couples closer, not create pressure." },
            { title: "Simple by design", desc: "We deliberately keep the interface minimal. You shouldn't need a tutorial to understand what's happening today." },
          ].map(({ title, desc }) => (
            <div key={title} className="glass-panel" style={{ padding: "1.25rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8b5cf6", marginTop: "0.5rem", flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, margin: "0 0 0.3rem", fontSize: "0.95rem" }}>{title}</p>
                <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Creator */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>Who Built This</h2>
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <p style={{ color: "#cbd5e1", lineHeight: 1.8, margin: "0 0 1rem" }}>
            Red Zone was created by Denis — a developer who built this for his own relationship and realized other
            couples needed it too. The goal was simple: a clean, private tool that makes cycle awareness effortless
            for both people in a relationship.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>
            The project is supported through Ko-fi memberships. If Red Zone helps your relationship, consider
            becoming a member — it keeps the app running and improving.
          </p>
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="https://ko-fi.com/denissalmon"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#a78bfa", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
            >
              Ko-fi →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ marginBottom: "3rem" }}>
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
          <h2 style={{ marginBottom: "0.75rem", fontSize: "1.5rem" }}>Ready to get started?</h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            Free to use. Takes two minutes to set up.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn" style={{ padding: "0.875rem 2rem", textDecoration: "none" }}>
                Try Red Zone Free
            </Link>
            <Link href="/blog" style={{ color: "#c4b5fd", textDecoration: "none", alignSelf: "center", fontSize: "0.9rem", fontWeight: 600 }}>
              Read the Blog →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
