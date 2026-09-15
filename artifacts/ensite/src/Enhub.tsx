import SiteNav from "./components/SiteNav";

function Enhub() {
  return (
    <div className="ensite-page">
      <SiteNav current="enhub" />

      <main className="ensite-content">
        <p className="ensite-label">enhub</p>

        <h1>
          ENGENE
          <br />
          <span>resources.</span>
        </h1>

        {/* Enhub content goes here */}
      </main>

      <footer className="ensite-footer">
        made for ENGENEs, by ENGENEs
      </footer>
    </div>
  );
}

export default Enhub;