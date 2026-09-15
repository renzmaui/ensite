import SiteNav from "./components/SiteNav";

function About() {
  return (
    <div className="ensite-page about-page">
      <SiteNav current="about" />

      <main className="ensite-content about-content">
        <p className="ensite-label">about</p>

        <h1>
          for ENGENEs,
          <br />
          by ENGENEs.
        </h1>

        <p className="ensite-tagline">
          Ensite is a small home for passion projects, tools, and ideas made
          with ENGENEs in mind.
        </p>

        <p className="ensite-description">
          Oh, you're here. Thank you for dropping by. 🤍
        </p>

        <p className="ensite-description">
          This little corner of the internet is built with love, curiosity,
          and a lot of free time. It's still a work in progress, so thank you
          for being here while it grows.
        </p>

        <h2 className="ensite-section-title">What you'll find here</h2>

        <div className="ensite-project">
          <a href="/enchant" className="ensite-link">
            enter enchant →
          </a>

          <p className="ensite-project-description">
            An ENHYPEN fanchant guide designed to help ENGENEs learn, practice,
            and chant along with confidence.
          </p>
        </div>

        <div className="ensite-project">
          <a href="/enhub" className="ensite-link">
            enter enhub →
          </a>

          <p className="ensite-project-description">
            A growing collection of ENGENE resources, including voting,
            streaming, donation projects, fanbases, and other community
            efforts.
          </p>
        </div>

        <h2 className="ensite-section-title">A little more</h2>

        <p className="ensite-description">
          Ensite is an independent, fan-made project and is not affiliated with
          ENHYPEN, BELIFT LAB, or HYBE.
        </p>

        <p className="ensite-description">
          It's simply a little corner of the internet made for fellow ENGENEs.
        </p>

        <p className="ensite-description">
          More things are on the way. 🤍
        </p>
      </main>

      <footer className="ensite-footer">
        made for ENGENEs, by ENGENEs
      </footer>
    </div>
  );
}

export default About;
