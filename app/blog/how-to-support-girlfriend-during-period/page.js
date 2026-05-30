import Link from "next/link";

export const metadata = {
  title: "How to Support Your Girlfriend During Her Period: What Actually Helps",
  description: "Practical, honest advice on how to support your girlfriend during her period. Learn what to say, what to do, and what to avoid—based on what women actually want.",
  keywords: "how to support girlfriend during period, help girlfriend on period, what to do when girlfriend has period, period support boyfriend, girlfriend period tips",
  alternates: {
    canonical: "https://redzonecouple.site/blog/how-to-support-girlfriend-during-period",
  },
  openGraph: {
    title: "How to Support Your Girlfriend During Her Period: What Actually Helps",
    description: "Practical, honest advice on how to support your girlfriend during her period. Learn what to say, what to do, and what to avoid—based on what women actually want.",
    url: "https://redzonecouple.site/blog/how-to-support-girlfriend-during-period",
    type: "article",
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Support Your Girlfriend During Her Period: What Actually Helps",
  datePublished: "2026-04-07",
  dateModified: "2026-04-07",
  author: { "@type": "Organization", name: "Red Zone" },
  publisher: { "@type": "Organization", name: "Red Zone", url: "https://redzonecouple.site" },
  url: "https://redzonecouple.site/blog/how-to-support-girlfriend-during-period",
  description: "Practical, honest advice on how to support your girlfriend during her period. Learn what to say, what to do, and what to avoid—based on what women actually want.",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://redzonecouple.site" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://redzonecouple.site/blog" },
    { "@type": "ListItem", position: 3, name: "How to Support Your Girlfriend During Her Period" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What should I say to my girlfriend when she's on her period?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Keep it simple and sincere. Try 'What do you need right now?' or 'I'm here if you want company or space.' Avoid minimizing her pain or blaming her mood on her period. Acknowledge what she's feeling without trying to fix it.",
      },
    },
    {
      "@type": "Question",
      name: "What should I avoid doing when my girlfriend is on her period?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Never say 'Are you on your period?' during a disagreement. Don't dismiss her feelings as 'just hormones.' Avoid pressuring her into plans she's not up for, and don't act grossed out by a normal bodily function.",
      },
    },
    {
      "@type": "Question",
      name: "How can I track my girlfriend's period to be more supportive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use a couple-friendly period tracker like Red Zone that both partners can access. This way you'll know what phase she's in without having to ask, and you can prepare to be more supportive during the days she needs it most.",
      },
    },
  ],
};

export default function SupportGirlfriendDuringPeriodBlog() {
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Navigation */}
      <div style={{ marginBottom: "3rem" }}>
        <Link href="/blog">
          <span style={{ color: "#94a3b8", textDecoration: "underline", cursor: "pointer", fontSize: "0.95rem" }}>
            ← Back to Blog
          </span>
        </Link>
      </div>

      {/* Article Header */}
      <article>
        <header style={{ marginBottom: "3rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.85rem",
              color: "#fbbf24",
              fontWeight: "600",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Support & Communication
          </span>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: "1.2" }}>
            How to Support Your Girlfriend During Her Period: What Actually Helps
          </h1>
          <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            <p style={{ margin: "0.5rem 0" }}>Published on April 7, 2026</p>
            <p style={{ margin: "0.5rem 0" }}>Reading time: 7 minutes</p>
          </div>
        </header>

        {/* Content */}
        <div className="blog-content" style={{ lineHeight: "1.8", fontSize: "1.05rem" }}>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            Let's be real: most guys have no idea what to do when their girlfriend is on her period. You want to help,
            but you're worried about saying the wrong thing, overstepping, or accidentally making things worse. The
            good news is that being a supportive partner during her period isn't complicated—it just requires a little
            knowledge and a lot of genuine care.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>First, Understand What She's Going Through</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            A period isn't just bleeding. It comes with a cascade of physical and emotional symptoms that vary from
            person to person and cycle to cycle. Common experiences include cramping (which can range from mild
            discomfort to debilitating pain), fatigue, bloating, headaches, lower back pain, and mood changes driven
            by shifting hormone levels.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            Some women describe their worst period days as feeling like a bad flu combined with emotional
            vulnerability. Others have relatively mild symptoms. The point is: you won't know unless you ask and pay
            attention. Every person's experience is different, and your girlfriend's experience is the only one that
            matters for your relationship.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>Things That Actually Help</h2>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Ask what she needs—and listen.</strong> The single most effective thing
            you can do is ask "What would help right now?" and then follow through. Sometimes she wants company.
            Sometimes she wants to be alone. Sometimes she wants you to handle dinner. The answer will change from
            day to day, and that's okay.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Handle logistics without being asked.</strong> Pick up groceries. Do
            the dishes. Walk the dog. Take something off her plate without making a big deal about it. This isn't
            about performing grand gestures—it's about quietly reducing her load when she's not feeling her best.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Have comfort supplies ready.</strong> Know what helps her: ibuprofen,
            a heating pad, her favorite tea, chocolate, a specific comfort meal. You don't need to stock a pharmacy,
            but having these things available shows that you've been paying attention.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Be physically present without pressure.</strong> Offer a back rub or
            cuddle, but don't push if she's not in the mood for physical contact. Sometimes just sitting together on
            the couch watching her favorite show is exactly what she needs.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Adjust your plans gracefully.</strong> If you had plans to go out and
            she's not feeling it, don't guilt-trip her. Suggest a low-key alternative without resentment. "Let's
            just order in and watch something" can be the most caring sentence you say all week.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>Things to Absolutely Avoid</h2>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Never weaponize her period.</strong> "Are you on your period?" during
            an argument is one of the most dismissive things you can say. It invalidates her feelings and reduces a
            real emotional experience to a biological inconvenience. Even if her cycle is a factor, her feelings are
            still real and still deserve respect.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Don't act disgusted.</strong> Periods are a normal, healthy bodily
            function. If she mentions needing tampons or pads, treat it with the same energy you'd give any household
            supply. Being squeamish about it signals immaturity and makes her feel like she needs to hide a completely
            natural part of her life from you.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Don't try to "fix" her mood.</strong> You can't logic someone out of
            PMS symptoms. Resist the urge to problem-solve when she just wants to vent. Sometimes the most supportive
            response is "That sounds really tough" followed by silence.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>Don't compare her to others.</strong> "My ex never had it this bad"
            or "My sister handles it fine" are relationship-damaging statements. Her experience is hers, and
            comparing it to anyone else's is unhelpful and hurtful.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>The Power of Knowing When It's Coming</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            Half the battle of being supportive is timing. If you know her period is coming in two days, you can
            proactively stock the fridge with comfort food, clear the evening schedule, and mentally prepare to be
            more patient. If it catches you off guard every month, you're always playing catch-up.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            That's why a shared period tracker makes such a difference. With an app like Red Zone, you can see where
            she is in her cycle without having to ask "is it that time?" (which, again, you should never say). You
            just quietly know, and you show up prepared. She'll notice. Trust me—she'll notice.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>It's Not Just About Her Period</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            Here's the thing most articles about "supporting your girlfriend during her period" miss: her cycle
            affects the entire month, not just the days she's bleeding. The week before her period (the luteal phase)
            is often when PMS symptoms are worst. The week after (the follicular phase) is usually when she feels
            most energized and optimistic.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "2rem" }}>
            Being a truly supportive partner means understanding the full cycle—not just showing up with chocolate
            once a month. When you track together and learn the pattern, your support becomes consistent instead of
            reactive. That's what separates a good partner from a great one.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>Frequently Asked Questions</h2>

          <h3 style={{ fontSize: "1.3rem", marginTop: "1.5rem", marginBottom: "0.75rem", color: "#e2e8f0" }}>
            What should I say to my girlfriend when she's on her period?
          </h3>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            Keep it simple and sincere. Try "What do you need right now?" or "I'm here if you want company or
            space." Avoid minimizing her pain or blaming her mood on her period. Acknowledge what she's feeling
            without trying to fix it.
          </p>

          <h3 style={{ fontSize: "1.3rem", marginTop: "1.5rem", marginBottom: "0.75rem", color: "#e2e8f0" }}>
            What should I avoid doing when my girlfriend is on her period?
          </h3>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            Never say "Are you on your period?" during a disagreement. Don't dismiss her feelings as "just hormones."
            Avoid pressuring her into plans she's not up for, and don't act grossed out by a normal bodily function.
          </p>

          <h3 style={{ fontSize: "1.3rem", marginTop: "1.5rem", marginBottom: "0.75rem", color: "#e2e8f0" }}>
            How can I track my girlfriend's period to be more supportive?
          </h3>
          <p style={{ color: "#cbd5e1", marginBottom: "2rem" }}>
            Use a couple-friendly period tracker like Red Zone that both partners can access. This way you'll know
            what phase she's in without having to ask, and you can prepare to be more supportive during the days she
            needs it most.
          </p>

          {/* CTA */}
          <div
            className="glass-panel"
            style={{
              padding: "2rem",
              textAlign: "center",
              marginTop: "3rem",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Be the partner she deserves</h3>
            <p style={{ color: "#cbd5e1", marginBottom: "1.5rem" }}>
              Red Zone helps you understand her cycle so you can show up with the right support at the right time.
            </p>
            <Link href="/">
              <button
                className="btn"
                style={{
                  background: "var(--primary)",
                  color: "#000",
                  fontWeight: "700",
                  paddingLeft: "2rem",
                  paddingRight: "2rem",
                }}
              >
                Try Red Zone Free
              </button>
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>Related Articles</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            <Link href="/blog/cycle-syncing-for-couples" style={{ textDecoration: "none" }}>
              <div className="glass-panel" style={{ padding: "1.25rem", cursor: "pointer" }}>
                <span style={{ fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Wellness</span>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", margin: "0.5rem 0 0.4rem", lineHeight: 1.4, color: "#e2e8f0" }}>Cycle Syncing for Couples: How to Align Your Relationship with Her Cycle</p>
                <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>Read More →</span>
              </div>
            </Link>
            <Link href="/blog/how-to-support-partner-during-pms" style={{ textDecoration: "none" }}>
              <div className="glass-panel" style={{ padding: "1.25rem", cursor: "pointer" }}>
                <span style={{ fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Support</span>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", margin: "0.5rem 0 0.4rem", lineHeight: 1.4, color: "#e2e8f0" }}>How to Support Your Partner During PMS: A Practical Guide</p>
                <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>Read More →</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{ paddingTop: "2rem", marginTop: "2rem" }}>
          <Link href="/blog">
            <span style={{ color: "#94a3b8", textDecoration: "underline", cursor: "pointer" }}>
              ← Back to Blog
            </span>
          </Link>
        </div>
      </article>
    </div>
  );
}
