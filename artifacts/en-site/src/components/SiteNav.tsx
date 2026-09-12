interface SiteNavProps {
  current?: "home" | "enchant" | "about";
}

function SiteNav({ current }: SiteNavProps) {
  return (
    <header className="ensite-nav-header">
      <a href="/" className="ensite-nav-brand">
        ensite
      </a>

      <nav className="ensite-nav-links" aria-label="Main navigation">
        <a
          href="/enchant"
          className={current === "enchant" ? "active" : ""}
        >
          enchant
        </a>

        <a
          href="/about"
          className={current === "about" ? "active" : ""}
        >
          about
        </a>
      </nav>
    </header>
  );
}

export default SiteNav;