import SiteNav from "./components/SiteNav";

function Voting() {
  return (
    <div className="ensite-page">
      <SiteNav current="enhub" />

      <main className="ensite-content">
        <p className="ensite-label">enhub / voting</p>

        <h1>
          voting
          <br />
          <span>resources.</span>
        </h1>

        {/* Voting content */}
      </main>

      <footer className="ensite-footer">
        made for ENGENEs, by ENGENEs
      </footer>
    </div>
  );
}

export default Voting;