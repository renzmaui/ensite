import Enchant from "./Enchant";
import Enhub from "./Enhub";
import Voting from "./Voting";
import Streaming from "./Streaming";
import Donation from "./Donation";
import About from "./About";
import SiteNav from "./components/SiteNav";

function App() {
  const path = window.location.pathname;

  if (path === "/enchant") {
    return <Enchant />;
  }

  if (path === "/enhub") {
    return <Enhub />;
  }

  if (path === "/enhub/voting") {
    return <Voting />;
  }

  if (path === "/enhub/streaming") {
    return <Streaming />;
  }

  if (path === "/enhub/donation") {
    return <Donation />;
  }

  if (path === "/about") {
    return <About />;
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
