import Link from "next/link";

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "How to Support Your Partner During PMS: A Practical Guide",
  "datePublished": "2026-03-25",
  "dateModified": "2026-03-25",
  "author": { "@type": "Organization", "name": "Red Zone" },
  "publisher": { "@type": "Organization", "name": "Red Zone", "url": "https://redzonecouple.site" },
  "url": "https://redzonecouple.site/blog/how-to-support-partner-during-pms",
  "description": "Learn science-backed strategies to support your partner through menstrual cycle phases. Understand mood changes, physical symptoms, and practical ways to help.",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://redzonecouple.site" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://redzonecouple.site/blog" },
    { "@type": "ListItem", "position": 3, "name": "How to Support Your Partner During PMS" },
  ],
};

export const metadata = {
  title: "How to Support Your Partner During PMS: A Practical Guide",
  description: "Learn science-backed strategies to support your partner through menstrual cycle phases. Understand mood changes, physical symptoms, and practical ways to help.",
  keywords: "how to support partner during PMS, help girlfriend PMS, menstrual cycle mood changes, partner PMS support",
  alternates: {
    canonical: "https://redzonecouple.site/blog/how-to-support-partner-during-pms",
  },
  openGraph: {
    title: "How to Support Your Partner During PMS: A Practical Guide",
    description: "Learn science-backed strategies to support your partner through menstrual cycle phases. Understand mood changes, physical symptoms, and practical ways to help.",
    url: "https://redzonecouple.site/blog/how-to-support-partner-during-pms",
    type: "article",
  },
};

export default function HowToSupportPartnerDuringPmsBlog() {
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
            Support & Care
          </span>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: "1.2" }}>
            How to Support Your Partner During PMS: A Practical Guide
          </h1>
          <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            <p style={{ margin: "0.5rem 0" }}>Published on March 25, 2026</p>
            <p style={{ margin: "0.5rem 0" }}>Reading time: 7 minutes</p>
          </div>
        </header>

        {/* Content */}
        <div className="blog-content" style={{ lineHeight: "1.8", fontSize: "1.05rem" }}>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            Supporting a partner during PMS isn't about tolerating bad moods—it's about understanding real biological changes and
            responding with genuine care. The good news? Most partners want to help but don't know how. This guide breaks down the
            science and gives you practical strategies for each phase of the cycle.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>
            The Science: What's Actually Happening
          </h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            PMS (Premenstrual Syndrome) isn't a psychological issue. It's a real response to hormonal fluctuations. In the luteal phase
            (the second half of the cycle, roughly days 15–28), progesterone and estrogen levels drop sharply. This hormonal shift
            affects:
          </p>

          <ul style={{ color: "#cbd5e1", marginBottom: "1rem", marginLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Mood regulation:</strong> Lower serotonin means emotions feel more intense
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Sleep quality:</strong> Progesterone drops make it harder to fall and stay asleep
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Energy levels:</strong> Many people feel more tired during this phase
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Physical discomfort:</strong> Bloating, headaches, breast tenderness, and muscle aches
              are common
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Stress sensitivity:</strong> The nervous system processes stress more intensely
            </li>
          </ul>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            When you understand this, you realize that a partner who seems irritable or withdrawn isn't choosing that—her brain and
            body are literally experiencing more activation. Knowing this is the first step to genuine support.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>Phase 1: Follicular Phase (Days 1–7)</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            This is when menstruation occurs. Energy is often lower, and there's physical discomfort to manage.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "0.5rem" }}>
            <strong style={{ color: "#fff" }}>What she might need:</strong>
          </p>
          <ul style={{ color: "#cbd5e1", marginBottom: "1rem", marginLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>Pain relief (ibuprofen or heat pads often help more than you'd think)</li>
            <li style={{ marginBottom: "0.5rem" }}>Extra rest and low-pressure time together</li>
            <li style={{ marginBottom: "0.5rem" }}>Flexibility with plans—canceling that 8 PM dinner if she's exhausted is supportive, not annoying</li>
            <li style={{ marginBottom: "0.5rem" }}>Comfort foods (chocolate, salty snacks, her favorites)</li>
            <li style={{ marginBottom: "0.5rem" }}>Hydration reminders—dehydration makes everything worse</li>
          </ul>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>What not to do:</strong> Don't ask "Are you sure you need more pain meds?" or suggest her
            pain is exaggerated. Trust her about her own body.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>Phase 2: Ovulatory Phase (Days 8–14)</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            Estrogen peaks, energy returns, and mood is typically uplifted. This is often the phase where people feel their best.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "0.5rem" }}>
            <strong style={{ color: "#fff" }}>What she might need:</strong>
          </p>
          <ul style={{ color: "#cbd5e1", marginBottom: "1rem", marginLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>This is a great time for plans, social activities, and challenges</li>
            <li style={{ marginBottom: "0.5rem" }}>She probably has energy for that hike, dinner party, or project you've been planning</li>
            <li style={{ marginBottom: "0.5rem" }}>Confidence is usually higher—compliments land particularly well</li>
          </ul>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>What not to do:</strong> Don't assume this mood is the "real" baseline and expect it year-round.
            The cycle is real; all phases are normal.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>Phase 3: Luteal Phase (Days 15–21)</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            This is post-ovulation. Hormones are rising again, but the gradual shift can bring mood changes and fatigue. It's not as
            intense as PMS yet, but energy might dip.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "0.5rem" }}>
            <strong style={{ color: "#fff" }}>What she might need:</strong>
          </p>
          <ul style={{ color: "#cbd5e1", marginBottom: "1rem", marginLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>A bit more space and time alone—introversion often increases in this phase</li>
            <li style={{ marginBottom: "0.5rem" }}>Validation if she wants to skip social plans or quiet evenings at home</li>
            <li style={{ marginBottom: "0.5rem" }}>Lower-key dates (movie night rather than crowded restaurants)</li>
            <li style={{ marginBottom: "0.5rem" }}>Check-ins: "How are you feeling? What would help?"</li>
          </ul>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>What not to do:</strong> Don't interpret her need for quiet as rejection. This is a normal
            variation, not a sign something is wrong.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>Phase 4: The Context Zone (Days 22–28)</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            This is the most intense phase of the luteal period—often called PMS. Progesterone is at its lowest, and the drop happens
            rapidly. This is when support is most critical.
          </p>

          <p style={{ color: "#cbd5e1", marginBottom: "0.5rem" }}>
            <strong style={{ color: "#fff" }}>What she might experience:</strong>
          </p>
          <ul style={{ color: "#cbd5e1", marginBottom: "1rem", marginLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>Emotional intensity (sadness, irritability, or even anger feel more powerful)</li>
            <li style={{ marginBottom: "0.5rem" }}>Brain fog or difficulty concentrating</li>
            <li style={{ marginBottom: "0.5rem" }}>Physical symptoms (cramps, headaches, bloating, fatigue)</li>
            <li style={{ marginBottom: "0.5rem" }}>Sleep disruption</li>
            <li style={{ marginBottom: "0.5rem" }}>Negative self-talk or catastrophizing</li>
          </ul>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>What to do:</strong>
          </p>
          <ul style={{ color: "#cbd5e1", marginBottom: "1rem", marginLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Don't take it personally.</strong> If she's snappy or withdrawn, remember: this is the
              Context Zone. It's not about you.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Reduce demands.</strong> This isn't the week for difficult conversations or planning
              changes. Keep things steady.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Increase comfort.</strong> Favorite foods, heating pads, your presence without
              expectations.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Offer specific help.</strong> Instead of "Let me know if you need anything," say "I'm
              making dinner tonight" or "Want me to pick up ibuprofen?"
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Listen without fixing.</strong> Sometimes she just needs to be heard, not solutions.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#fff" }}>Stay present.</strong> A hug, sitting nearby, or even just being available means a lot.
            </li>
          </ul>

          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            <strong style={{ color: "#fff" }}>What NOT to do:</strong>
          </p>
          <ul style={{ color: "#cbd5e1", marginBottom: "1rem", marginLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>Don't say, "It's just your hormones." Yes, it IS hormones—and that's real.</li>
            <li style={{ marginBottom: "0.5rem" }}>Don't dismiss her feelings or suggest she's overreacting.</li>
            <li style={{ marginBottom: "0.5rem" }}>Don't expect her to be the same as during the ovulatory phase.</li>
            <li style={{ marginBottom: "0.5rem" }}>Don't start serious conversations or criticism during this time.</li>
          </ul>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>The Tool That Makes It Easier</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
            You might think, "This is a lot to remember." And you're right—it would be if you had to track it all mentally. That's where
            an app like Red Zone helps. Both partners can see exactly which phase you're in, what to expect, and practical suggestions
            for that specific day. You don't have to guess or rely on memory. The support becomes automatic and informed.
          </p>

          <h2 style={{ fontSize: "1.8rem", marginTop: "2rem", marginBottom: "1rem" }}>The Bottom Line</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "2rem" }}>
            Supporting a partner through PMS isn't a burden—it's one of the most meaningful ways you can show love. Every cycle phase is
            normal, every emotion is valid, and your awareness and presence make an enormous difference. When both partners understand
            and respect the cycle, relationships don't just survive PMS week—they thrive.
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
            <h3 style={{ marginBottom: "1rem" }}>Make cycle support effortless</h3>
            <p style={{ color: "#cbd5e1", marginBottom: "1.5rem" }}>
              Red Zone shows you exactly what phase you're in and how to support each other. Get started free today.
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
            <Link href="/blog/period-tracker-for-boyfriends" style={{ textDecoration: "none" }}>
              <div className="glass-panel" style={{ padding: "1.25rem", cursor: "pointer" }}>
                <span style={{ fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Couples</span>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", margin: "0.5rem 0 0.4rem", lineHeight: 1.4, color: "#e2e8f0" }}>Period Tracker for Boyfriends: Why Men Are Tracking Their Partner's Cycle</p>
                <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>Read More →</span>
              </div>
            </Link>
            <Link href="/blog/cycle-tracking-for-couples" style={{ textDecoration: "none" }}>
              <div className="glass-panel" style={{ padding: "1.25rem", cursor: "pointer" }}>
                <span style={{ fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Relationships</span>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", margin: "0.5rem 0 0.4rem", lineHeight: 1.4, color: "#e2e8f0" }}>Cycle Tracking for Couples: How Sharing Period Data Strengthens Relationships</p>
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
