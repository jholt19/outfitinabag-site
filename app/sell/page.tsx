import Link from "next/link";
import Image from "next/image";

export default function SellPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      {/* HERO */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 28,
          alignItems: "center",
          background: "linear-gradient(180deg,#fafafa 0%,#f5f5f5 100%)",
          border: "1px solid #ececec",
          borderRadius: 28,
          padding: 32,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              background: "#111",
              color: "white",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: 0.6,
              borderRadius: 999,
              padding: "8px 14px",
            }}
          >
            SELL ON OUTFITINABAG
          </div>

          <h1
            style={{
              fontSize: 56,
              fontWeight: 950,
              lineHeight: 0.96,
              letterSpacing: -1.5,
              color: "#111",
              margin: "16px 0 0",
            }}
          >
            Sell your brand
            <br />
            through complete
            <br />
            outfits
          </h1>

          <p
            style={{
              marginTop: 18,
              fontSize: 17,
              lineHeight: 1.6,
              color: "#222",
              maxWidth: 560,
            }}
          >
            OutfitInABag helps independent brands reach new customers by selling
            complete outfits instead of single products. Customers shop the full
            fit in one click, and you keep 80% of the sale.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 22,
            }}
          >
            <a href="#apply" style={primaryBtn}>
              APPLY AS A VENDOR
            </a>
            <Link href="/outfits" style={secondaryBtn}>
              VIEW EXAMPLE FITS
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <div style={miniStat}>
              <div style={miniStatTop}>80%</div>
              <div style={miniStatBottom}>vendor payout</div>
            </div>
            <div style={miniStat}>
              <div style={miniStatTop}>1 click</div>
              <div style={miniStatBottom}>full fit checkout</div>
            </div>
            <div style={miniStat}>
              <div style={miniStatTop}>Featured</div>
              <div style={miniStatBottom}>lookbook + homepage</div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            height: 430,
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid #e8e8e8",
            background: "#ddd",
          }}
        >
          <Image
            src="/outfits/for-1.jpg"
            alt="Brand feature preview"
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 16,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 16,
              padding: 14,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: "#666",
                letterSpacing: 0.5,
              }}
            >
              FOUNDING BRANDS
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#111",
                marginTop: 4,
              }}
            >
              Get featured in curated fits
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#555",
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              Join early and get visibility across the homepage, lookbook, and
              occasion-based collections.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={sectionWrap}>
        <div style={sectionEyebrow}>HOW IT WORKS</div>
        <h2 style={sectionTitle}>A simple 3-step flow</h2>

        <div style={threeGrid}>
          <div style={infoCard}>
            <div style={stepNumber}>01</div>
            <div style={infoTitle}>Apply and share your brand</div>
            <div style={infoText}>
              Tell us about your products, audience, and what kind of outfits
              your brand fits best.
            </div>
          </div>

          <div style={infoCard}>
            <div style={stepNumber}>02</div>
            <div style={infoTitle}>We build complete outfits</div>
            <div style={infoText}>
              Your items are featured in vendor-created or OutfitInABag-curated
              looks built around real occasions and style moments.
            </div>
          </div>

          <div style={infoCard}>
            <div style={stepNumber}>03</div>
            <div style={infoTitle}>You fulfill and get paid</div>
            <div style={infoText}>
              Customers buy the full fit in one checkout. You fulfill your item
              and keep 80% of the sale.
            </div>
          </div>
        </div>
      </section>

      {/* WHY BRANDS JOIN */}
      <section style={sectionWrap}>
        <div style={sectionEyebrow}>WHY BRANDS JOIN</div>
        <h2 style={sectionTitle}>More than another product listing</h2>

        <div style={twoGrid}>
          <div style={featureBox}>
            <div style={featureTitle}>Sell complete looks</div>
            <div style={featureText}>
              Your products sell as part of an outfit, not just as isolated
              items. That gives your brand stronger context and better discovery.
            </div>
          </div>

          <div style={featureBox}>
            <div style={featureTitle}>Reach new customers</div>
            <div style={featureText}>
              Your items appear in curated fit feeds, lookbooks, and
              occasion-based collections customers actually browse.
            </div>
          </div>

          <div style={featureBox}>
            <div style={featureTitle}>Look premium on-platform</div>
            <div style={featureText}>
              OutfitInABag is built to feel editorial and curated, giving your
              brand a stronger presence than a plain marketplace listing.
            </div>
          </div>

          <div style={featureBox}>
            <div style={featureTitle}>Keep your own fulfillment flow</div>
            <div style={featureText}>
              You continue to fulfill your items. No need to hand over your
              inventory just to join the platform.
            </div>
          </div>
        </div>
      </section>

      {/* ECONOMICS */}
      <section
        style={{
          ...economicsSection,
          gridTemplateColumns:
            typeof window === "undefined" ? "1fr 1fr" : undefined,
        }}
      >
        <div>
          <div style={sectionEyebrow}>VENDOR EARNINGS</div>
          <h2 style={sectionTitle}>Transparent economics</h2>
          <p style={bodyText}>
            Customers buy complete outfits. The platform keeps 20%. Vendors keep
            80% of the sale based on the products included in the fit.
          </p>
        </div>

        <div style={economicsCard}>
          <div style={economicsRow}>
            <span>Example outfit price</span>
            <strong>$200.00</strong>
          </div>
          <div style={economicsRow}>
            <span>Vendor payout (80%)</span>
            <strong>$160.00</strong>
          </div>
          <div style={{ ...economicsRow, borderBottom: "none" }}>
            <span>Platform fee (20%)</span>
            <strong>$40.00</strong>
          </div>
        </div>
      </section>

      {/* FOUNDING BRAND PROGRAM */}
      <section style={sectionWrap}>
        <div style={sectionEyebrow}>FOUNDING BRAND PROGRAM</div>
        <h2 style={sectionTitle}>Early brands get extra visibility</h2>

        <div style={threeGrid}>
          <div style={infoCard}>
            <div style={infoTitle}>Homepage placement</div>
            <div style={infoText}>
              Early brands can be featured across the homepage, trending fits,
              and occasion collections.
            </div>
          </div>

          <div style={infoCard}>
            <div style={infoTitle}>Lookbook spotlight</div>
            <div style={infoText}>
              We’ll feature selected products in editorial-style layouts to make
              your brand feel premium and styled.
            </div>
          </div>

          <div style={infoCard}>
            <div style={infoTitle}>Launch visibility</div>
            <div style={infoText}>
              Founding brands will be positioned as early partners as the
              marketplace grows.
            </div>
          </div>
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" style={applySection}>
        <div>
          <div style={sectionEyebrow}>APPLY</div>
          <h2 style={sectionTitle}>Become a vendor</h2>
          <p style={bodyText}>
            Submit your brand information and we’ll review it for upcoming fit
            collections and launch features.
          </p>
        </div>

        <form style={applyForm}>
          <label style={label}>
            Brand name
            <input type="text" style={input} placeholder="Your brand name" />
          </label>

          <label style={label}>
            Contact email
            <input type="email" style={input} placeholder="name@brand.com" />
          </label>

          <label style={label}>
            Website
            <input
              type="text"
              style={input}
              placeholder="https://yourbrand.com"
            />
          </label>

          <label style={label}>
            Instagram / social handle
            <input type="text" style={input} placeholder="@yourbrand" />
          </label>

          <label style={label}>
            What do you sell?
            <textarea
              style={{ ...input, minHeight: 110, resize: "vertical" }}
              placeholder="Streetwear, casual basics, accessories, premium pieces, etc."
            />
          </label>

          <button type="button" style={primaryButtonReal}>
            APPLY AS A VENDOR
          </button>

          <div style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
            This can be connected to your real vendor application flow next.
          </div>
        </form>
      </section>
    </main>
  );
}

const sectionWrap: React.CSSProperties = {
  marginTop: 48,
};

const sectionEyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#666",
  letterSpacing: 0.7,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 950,
  color: "#111",
  margin: "6px 0 0",
  letterSpacing: -0.8,
};

const bodyText: React.CSSProperties = {
  color: "#222",
  fontSize: 16,
  lineHeight: 1.6,
  marginTop: 14,
  maxWidth: 580,
};

const threeGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 18,
  marginTop: 18,
};

const twoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 18,
  marginTop: 18,
};

const infoCard: React.CSSProperties = {
  border: "1px solid #ececec",
  borderRadius: 20,
  background: "white",
  padding: 20,
};

const stepNumber: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#666",
  letterSpacing: 0.5,
};

const infoTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#111",
  marginTop: 10,
};

const infoText: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#555",
  marginTop: 8,
};

const featureBox: React.CSSProperties = {
  border: "1px solid #ececec",
  borderRadius: 20,
  background: "#fafafa",
  padding: 22,
};

const featureTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#111",
};

const featureText: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#555",
  marginTop: 8,
};

const economicsSection: React.CSSProperties = {
  marginTop: 48,
  border: "1px solid #ececec",
  borderRadius: 28,
  background: "linear-gradient(180deg,#fafafa 0%,#f5f5f5 100%)",
  padding: 28,
  display: "grid",
  gap: 24,
  alignItems: "center",
};

const economicsCard: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 20,
  background: "white",
  padding: 22,
};

const economicsRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #f0f0f0",
  color: "#111",
};

const applySection: React.CSSProperties = {
  marginTop: 48,
  border: "1px solid #ececec",
  borderRadius: 28,
  background: "#f8f8f8",
  padding: 28,
  display: "grid",
  gridTemplateColumns: "0.9fr 1.1fr",
  gap: 26,
  alignItems: "start",
};

const applyForm: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 20,
  background: "white",
  padding: 22,
  display: "grid",
  gap: 14,
};

const label: React.CSSProperties = {
  display: "grid",
  gap: 8,
  fontSize: 14,
  fontWeight: 700,
  color: "#111",
};

const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 14,
  color: "#111",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};

const miniStat: React.CSSProperties = {
  border: "1px solid #e6e6e6",
  background: "white",
  borderRadius: 16,
  padding: "12px 14px",
  minWidth: 160,
};

const miniStatTop: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#111",
};

const miniStatBottom: React.CSSProperties = {
  fontSize: 12,
  color: "#666",
  marginTop: 4,
};

const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "13px 18px",
  fontWeight: 900,
  background: "#111",
  color: "white",
  border: "none",
  borderRadius: 14,
  cursor: "pointer",
  fontSize: 14,
  textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "13px 18px",
  fontWeight: 900,
  background: "white",
  color: "#111",
  border: "1px solid #d9d9d9",
  borderRadius: 14,
  cursor: "pointer",
  fontSize: 14,
  textDecoration: "none",
};

const primaryButtonReal: React.CSSProperties = {
  padding: "14px 18px",
  fontWeight: 900,
  background: "#111",
  color: "white",
  border: "none",
  borderRadius: 14,
  cursor: "pointer",
  fontSize: 14,
  textDecoration: "none",
};