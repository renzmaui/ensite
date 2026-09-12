import Enchant from "./Enchant";
import SiteNav from "./components/SiteNav";

function App() {
  const path = window.location.pathname;

  if (path === "/enchant") {
    return <Enchant />;
  }

  if (path === "/about") {
    return (
      <div className="ensite-page">
<SiteNav current="about" />

        <main className="ensite-content">
          <p className="ensite-label">about</p>
          <h1>for ENGENEs,<br />by ENGENEs.</h1>
          <p>
            Ensite is a small home for projects and tools made for ENGENEs.
          </p>
          <p>
            This site is currently in development.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="ensite-page">
    <SiteNav current="home" />

      <main className="ensite-content">
        <p className="ensite-label">an ENGENE-made project</p>

        <h1>
          for ENGENEs,
          <br />
          <span>by ENGENEs.</span>
        </h1>

        <p className="ensite-description">
          A small home for projects, tools, and things made with ENGENEs in
          mind.
        </p>

        <a href="/enchant" className="ensite-link">
          enter enchant →
        </a>

        <p className="ensite-development">
          ensite is currently in development.
        </p>
      </main>

      <footer className="ensite-footer">
        made for ENGENEs, by ENGENEs
      </footer>
    </div>
  );
}

export default App;