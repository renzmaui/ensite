interface SiteNavProps {
  current?: "home" | "enchant" | "enhub" | "about";
}

function SiteNav({ current }: SiteNavProps) {
  return (
    <header className="ensite-nav-header">
      <a href="/" className="ensite-nav-brand">
        <img
          src="/ensite.png"
          alt=""
          className="ensite-nav-logo"
        />
        <span>ensite</span>
      </a>

      <nav className="ensite-nav-links" aria-label="Main navigation">
        <a
          href="/enchant"
          className={current === "enchant" ? "active" : ""}
        >
          enchant
        </a>

        <div className="ensite-nav-dropdown">
          <a
            href="/enhub"
            className={`ensite-nav-dropdown-trigger ${
              current === "enhub" ? "active" : ""
            }`}
          >
            enhub
          </a>

          <div className="ensite-nav-dropdown-menu">
              <a href="/enhub/voting">voting</a>
              <a href="/enhub/streaming">streaming</a>  
              {/* <a href="/enhub/donation">donation</a> */}
          </div>
        </div>

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