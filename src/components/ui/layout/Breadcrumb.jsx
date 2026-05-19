import { Link, useLocation } from "react-router-dom";

const LABELS = {
  "":          "Home",
  events:      "Events",
  blog:        "Blog",
  about:       "About",
  contact:     "Contact",
  announcements: "Announcements",
  notices:     "Notices",
  member:      "Member",
  dashboard:   "Dashboard",
  profile:     "Profile",
  "write-post": "Write Post",
  "my-posts":  "My Posts",
  admin:       "Admin",
};

export default function Breadcrumb() {
  const { pathname } = useLocation();

  // build segments: ["", "member", "dashboard"] → ["Home", "Member", "Dashboard"]
  const segments = pathname.split("/").filter(Boolean);

  // skip on homepage
  if (segments.length === 0) return null;

  // build crumbs array
  const crumbs = [
    { label: "Home", to: "/" },
    ...segments.map((seg, i) => ({
      label: LABELS[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      to: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  return (
    <nav
      style={{
        maxWidth: 1140,
        margin: "0 auto",
        padding: "14px 20px 0",
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        fontWeight: 500,
      }}
      aria-label="Breadcrumb"
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.to} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && (
              <span style={{ color: "#ccc", fontSize: 12 }}>/</span>
            )}
            {isLast ? (
              <span style={{ color: "#006A4E", fontWeight: 600 }}>{crumb.label}</span>
            ) : (
              <Link
                to={crumb.to}
                style={{ color: "#888", textDecoration: "none", transition: "color .15s" }}
                onMouseEnter={(e) => (e.target.style.color = "#111")}
                onMouseLeave={(e) => (e.target.style.color = "#888")}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}