import Link from "next/link";

export const metadata = {
  title: "Red Zone Blog — Relationship Tips & Cycle Insights",
  description: "Read articles about period tracking for couples, supporting partners during their cycle, and strengthening relationships through cycle awareness.",
  keywords: "period tracker, cycle tracking, couple relationships, PMS support, menstrual cycle education",
  alternates: {
    canonical: "https://redzonecouple.site/blog",
  },
  openGraph: {
    title: "Red Zone Blog — Relationship Tips & Cycle Insights",
    description: "Read articles about period tracking for couples, supporting partners during their cycle, and strengthening relationships through cycle awareness.",
    url: "https://redzonecouple.site/blog",
    type: "website",
  },
};

export default function BlogPage() {
  const blogPosts = [
    {
      title: "5 Relationship Problems That Disappear When You Start Tracking Her Cycle",
      slug: "relationship-problems-disappear-cycle-tracking",
      date: "May 30, 2026",
      excerpt:
        "Recurring fights, misread moods, and intimacy gaps often have a biological explanation. Discover why five common relationship problems trace back to the menstrual cycle—and how a period tracker app and cycle syncing fix them for good.",
      category: "Couples & Wellness",
    },
    {
      title: "The Boyfriend's Guide to Her Cycle: From Clueless to Connected in 30 Days",
      slug: "boyfriends-guide-her-cycle-clueless-to-connected",
      date: "May 19, 2026",
      excerpt:
        "A practical 30-day guide for boyfriends who want to understand their girlfriend's menstrual cycle. Learn how a period tracker app, cycle syncing, and menstrual cycle awareness can transform your relationship—one phase at a time.",
      category: "Guides & Education",
    },
    {
      title: "How a Period Tracker App Can Transform Your Relationship",
      slug: "period-tracker-app-transform-your-relationship",
      date: "May 11, 2026",
      excerpt:
        "Discover how a period tracker app for boyfriends builds empathy, reduces conflict, and deepens connection. A comprehensive guide to cycle syncing for couples, menstrual cycle awareness for men, and why the best couple apps include cycle tracking.",
      category: "Couples & Wellness",
    },
    {
      title: "Why Couples Who Track Together Stay Together",
      slug: "why-couples-who-track-together-stay-together",
      date: "May 4, 2026",
      excerpt:
        "The case for sharing a period tracker app with your partner. How menstrual cycle awareness, cycle syncing, and the right couple app transforms your relationship from reactive to proactive.",
      category: "Relationships & Wellness",
    },
    {
      title: "What Happens When Couples Start Tracking Her Cycle Together",
      slug: "what-happens-when-couples-track-her-cycle",
      date: "April 27, 2026",
      excerpt:
        "Real outcomes from couples who use a period tracker app together. From fewer arguments to better intimacy, here's what changes when you bring cycle awareness into your relationship.",
      category: "Couples & Wellness",
    },
    {
      title: "The Complete Guide to Period Tracking for Couples in 2026",
      slug: "complete-guide-period-tracking-for-couples",
      date: "April 16, 2026",
      excerpt:
        "Everything couples need to know about period tracker apps for boyfriends, cycle syncing together, menstrual cycle awareness for men, and the best couple apps for stronger relationships.",
      category: "Couples & Relationships",
    },
    {
      title: "Cycle Syncing for Couples: How to Align Your Relationship with Her Cycle",
      slug: "cycle-syncing-for-couples",
      date: "April 7, 2026",
      excerpt:
        "Learn how cycle syncing for couples works, why it improves relationships, and practical ways to align your routines, dates, and communication with each phase of the menstrual cycle.",
      category: "Wellness",
    },
    {
      title: "How to Support Your Girlfriend During Her Period: What Actually Helps",
      slug: "how-to-support-girlfriend-during-period",
      date: "April 7, 2026",
      excerpt:
        "Practical, honest advice on how to support your girlfriend during her period. Learn what to say, what to do, and what to avoid—based on what women actually want.",
      category: "Support",
    },
    {
      title: "Best Couple Apps for Relationships in 2026: Tools That Actually Work",
      slug: "best-couple-apps-for-relationships",
      date: "April 7, 2026",
      excerpt:
        "We tested dozens of couple apps across categories—communication, planning, health, and intimacy—to find the ones that actually make a difference. Here's what's worth your time.",
      category: "Apps & Tools",
    },
    {
      title: "Menstrual Cycle Awareness for Men: Everything You Should Know",
      slug: "menstrual-cycle-awareness-for-men",
      date: "April 7, 2026",
      excerpt:
        "A straightforward guide to the menstrual cycle for men. No jargon, no condescension—just the information you need to understand what your partner goes through every month.",
      category: "Education",
    },
    {
      title: "Period Tracker for Boyfriends: Why More Men Are Tracking Their Partner's Cycle",
      slug: "period-tracker-for-boyfriends",
      date: "March 28, 2026",
      excerpt:
        "Learn why partners are tracking cycles together and how it transforms communication, intimacy, and support in relationships. Discover the science behind the Context Zone.",
      category: "Couples",
    },
    {
      title: "How to Support Your Partner During PMS: A Practical Guide",
      slug: "how-to-support-partner-during-pms",
      date: "March 25, 2026",
      excerpt:
        "Master practical, science-backed strategies to support your partner through each phase of her cycle. From managing mood changes to understanding physical symptoms.",
      category: "Support",
    },
    {
      title: "Cycle Tracking for Couples: How Sharing Period Data Strengthens Relationships",
      slug: "cycle-tracking-for-couples",
      date: "March 22, 2026",
      excerpt:
        "Explore the benefits of transparent cycle awareness in relationships. Real-world scenarios show how shared insights lead to better planning and deeper connection.",
      category: "Relationships",
    },
  ];

  return (
    <div className="container">
      {/* Header */}
      <div className="blog-header" style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Red Zone Blog</h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#cbd5e1",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Insights for partners who want to be more supportive, more connected, and more understanding.
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "flex" }}>
            <article
              className="glass-panel"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#fbbf24",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {post.category}
              </span>
              <span style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                {post.date}
              </span>

              <h2
                style={{
                  fontSize: "1.2rem",
                  margin: "0.75rem 0",
                  lineHeight: "1.35",
                  fontWeight: 700,
                }}
              >
                {post.title}
              </h2>

              <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.6", margin: 0, flex: 1 }}>
                {post.excerpt}
              </p>

              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--primary)",
                    fontWeight: "600",
                  }}
                >
                  Read More →
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* CTA Section */}
      <div
        className="glass-panel"
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Ready to strengthen your relationship?</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "2rem", fontSize: "1.1rem" }}>
          Start tracking together with Red Zone and discover how cycle awareness transforms communication.
        </p>
        <Link href="/" className="btn" style={{
              background: "var(--primary)",
              color: "#000",
              fontWeight: "700",
              paddingLeft: "2.5rem",
              paddingRight: "2.5rem",
              textDecoration: "none",
            }}>
            Try Red Zone Free
        </Link>
      </div>

      {/* Back to Home */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Link href="/">
          <span style={{ color: "#94a3b8", textDecoration: "underline", cursor: "pointer" }}>
            ← Back to Red Zone
          </span>
        </Link>
      </div>
    </div>
  );
}
