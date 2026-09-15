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
          <span>by ENGENEs.</span>
        </h1>

        <p className="ensite-tagline">
          Ensite is a small home for passion projects, tools, and ideas made
          with ENGENEs in mind.
        </p>

        <p className="ensite-description">
          Oh, you're here! Thank you for dropping by. ☺︎
        </p>

        <p className="ensite-description">
          This little corner of the internet is built with love, curiosity,
          and a lot of free time. It's still a work in progress, so thank you
          for being here while it grows. More things are on the way. 
        </p>

        <h2 className="ensite-section-title">What you'll find here</h2>

        <div className="about-projects">
          <a href="/enchant" className="about-project">
            <span className="ensite-link">enter enchant →</span>

            <p>
              An ENHYPEN fanchant guide designed to help ENGENEs learn,
              practice, and chant along with confidence.
            </p>
          </a>

          <a href="/enhub" className="about-project">
            <span className="ensite-link">enter enhub →</span>

            <p>
              A growing collection of ENGENE resources, including voting,
              streaming, donation projects, fanbases, and other community
              efforts.
            </p>
          </a>
        </div>

      </main>

      <footer className="ensite-footer">
        made for ENGENEs, by ENGENEs
      </footer>
    </div>
  );
}

export default About;