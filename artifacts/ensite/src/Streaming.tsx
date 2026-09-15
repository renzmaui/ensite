import SiteNav from "./components/SiteNav";

function Streaming() {
  return (
    <div className="ensite-page">
      <SiteNav current="enhub" />

      <main className="ensite-content">
        <p className="ensite-label">enhub / streaming</p>

        <h1>
          streaming
          <br />
          <span>resources.</span>
        </h1>

        {/* Streaming content */}
      </main>

      <footer className="ensite-footer">
        made for ENGENEs, by ENGENEs
      </footer>
    </div>
  );
}

export default Streaming;