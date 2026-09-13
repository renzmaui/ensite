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

<h1>
  for ENGENEs,
  <br />
  by ENGENEs.
</h1>

<p className="ensite-description">
  Ensite is a small home for projects, tools, and ideas made with ENGENEs in mind.
</p>

<p className="ensite-description">
  Oh, you're here. Thank you for dropping by. 🤍
</p>

<p className="ensite-description">
  Maui is currently building this little corner of the internet in her free time,
  so thank you for your patience while it's still a work in progress.
</p>

<h2 className="ensite-section-title">
  What Maui is currently working on
</h2>

<div className="ensite-project">
  <h3>🎤 ENCHANT</h3>
  <p>
    An ENHYPEN fanchant guide designed to help ENGENEs learn, practice,
    and chant along with confidence.
  </p>
</div>

<div className="ensite-project">
  <h3>🍩 DUNKEN</h3>
  <p>
    Dunkin' Fun Meet projects and fan-made resources created by Maui for fellow ENGENEs.
  </p>
</div>

<p className="ensite-development">
  A passion project, by an ENGENE, for ENGENEs.
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