import SiteNav from "./components/SiteNav";

function Donation() {
  return (
    <div className="ensite-page">
      <SiteNav current="enhub" />

      <main className="ensite-content">
        <p className="ensite-label">enhub / donation</p>

        <h1>
          donation
          <br />
          <span>resources.</span>
        </h1>

        {/* Donation content */}
      </main>

      <footer className="ensite-footer">
        made for ENGENEs, by ENGENEs
      </footer>
    </div>
  );
}

export default Donation;