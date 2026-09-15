import SiteNav from "./components/SiteNav";
import "./styles/enhub.css";

function Enhub() {
  return (
    <div className="ensite-page">
      <SiteNav current="enhub" />

      <main className="ensite-content enhub-content">
        <p className="ensite-label">enhub</p>

        <h1>
          ENGENE
          <br />
          <span>resources.</span>
        </h1>

        <p className="enhub-intro">
          A small collection of streaming and voting resources,
          <br />
          gathered for ENGENEs.
        </p>

        <div className="enhub-board">
          {/* STREAMING */}
          <section
            className="enhub-section enhub-streaming"
            onClick={() => {
              window.location.href = "/enhub/streaming";
            }}
            role="link"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                window.location.href = "/enhub/streaming";
              }
            }}
          >
            <div className="enhub-section-header">
              <p className="enhub-section-label">01 / streaming</p>
              <h2>stream together.</h2>
            </div>

            <div className="enhub-cards">
              <a
                href="/enhub/streaming/guide"
                className="enhub-card enhub-card-feature"
                onClick={(event) => event.stopPropagation()}
              >
                <span>01</span>
                <div>
                  <p>guide</p>
                  <h3>Streaming Guide</h3>
                  <small>learn how to stream</small>
                </div>
                <strong>↗</strong>
              </a>

              <a
                href="#"
                className="enhub-card enhub-card-small"
                onClick={(event) => event.stopPropagation()}
              >
                <span>02</span>
                <div>
                  <p>spotify</p>
                  <h3>EN on Spotify</h3>
                </div>
                <strong>↗</strong>
              </a>

              <a
                href="#"
                className="enhub-card enhub-card-small"
                onClick={(event) => event.stopPropagation()}
              >
                <span>03</span>
                <div>
                  <p>stationhead</p>
                  <h3>EN Stationhead</h3>
                </div>
                <strong>↗</strong>
              </a>

              <a
                href="#"
                className="enhub-card enhub-card-wide"
                onClick={(event) => event.stopPropagation()}
              >
                <span>04</span>
                <div>
                  <p>youtube</p>
                  <h3>EN on YouTube</h3>
                </div>
                <strong>↗</strong>
              </a>
            </div>
          </section>

          {/* VOTING */}
          <section
            className="enhub-section enhub-voting"
            onClick={() => {
              window.location.href = "/enhub/voting";
            }}
            role="link"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                window.location.href = "/enhub/voting";
              }
            }}
          >
            <div className="enhub-section-header">
              <p className="enhub-section-label">02 / voting</p>
              <h2>every vote counts.</h2>
            </div>

            <div className="enhub-cards">
              <a
                href="/enhub/voting/guide"
                className="enhub-card enhub-card-feature"
                onClick={(event) => event.stopPropagation()}
              >
                <span>01</span>
                <div>
                  <p>guide</p>
                  <h3>Voting Guide</h3>
                  <small>learn how to vote</small>
                </div>
                <strong>↗</strong>
              </a>

              <a
                href="#"
                className="enhub-card enhub-card-feed"
                onClick={(event) => event.stopPropagation()}
              >
                <span>02</span>
                <div>
                  <p>accounts</p>
                  <h3>Voting Accounts</h3>
                </div>
                <strong>↗</strong>
              </a>

              <a
                href="/enhub/voting/apps"
                className="enhub-card enhub-card-small"
                onClick={(event) => event.stopPropagation()}
              >
                <span>03</span>
                <div>
                  <p>apps</p>
                  <h3>Voting Apps</h3>
                </div>
                <strong>↗</strong>
              </a>

              <a
                href="/enhub/voting/reminders"
                className="enhub-card enhub-card-wide"
                onClick={(event) => event.stopPropagation()}
              >
                <span>04</span>
                <div>
                  <p>reminders</p>
                  <h3>Voting Reminders</h3>
                </div>
                <strong>↗</strong>
              </a>
            </div>
          </section>
        </div>
      </main>

      <footer className="ensite-footer">
        made for ENGENEs, by ENGENEs
      </footer>
    </div>
  );
}

export default Enhub;