import SiteNav from "./components/SiteNav";
import Breadcrumb from "./components/Breadcrumb";
import "./styles/streaming.css";

function Streaming() {
  return (
    <div className="ensite-page">
      <SiteNav current="enhub" />

      <main className="ensite-content streaming-content">

        <Breadcrumb
          parent="ENHUB"
          parentPath="/enhub"
          current="Streaming Resources"
        />

        <h1>
          streaming
          <br />
          <span>resources.</span>
        </h1>

        <p className="streaming-intro">
          guides, links, and accounts to help ENGENEs
          <br />
          stream together.
        </p>

        <div className="streaming-board">
          {/* STREAMING GUIDE */}
          <section className="streaming-section streaming-guide">
            <div className="streaming-section-header">
              <p className="streaming-section-label">01 / guide</p>
              <h2>stream smarter.</h2>
              <p>
                Simple guides for the platforms ENGENEs use
                to support ENHYPEN.
              </p>
            </div>

            <div className="streaming-cards">
              <a
                href="/enhub/streaming/spotify"
                className="streaming-card streaming-card-feature"
              >
                <span className="streaming-card-number">01</span>
                <div>
                  <p className="streaming-card-label">spotify</p>
                  <h3>Spotify Guide</h3>
                  <p>how to stream on Spotify.</p>
                </div>
                <span className="streaming-card-arrow">↗</span>
              </a>

              <a
                href="/enhub/streaming/youtube"
                className="streaming-card"
              >
                <span className="streaming-card-number">02</span>
                <div>
                  <p className="streaming-card-label">youtube</p>
                  <h3>YouTube Guide</h3>
                  <p>how to support ENHYPEN on YouTube.</p>
                </div>
                <span className="streaming-card-arrow">↗</span>
              </a>

              <a
                href="/enhub/streaming/stationhead"
                className="streaming-card"
              >
                <span className="streaming-card-number">03</span>
                <div>
                  <p className="streaming-card-label">stationhead</p>
                  <h3>Stationhead Guide</h3>
                  <p>join streaming parties with ENGENEs.</p>
                </div>
                <span className="streaming-card-arrow">↗</span>
              </a>
            </div>
          </section>

          {/* ACCOUNTS TO FOLLOW */}
          <section className="streaming-section streaming-accounts">
            <div className="streaming-section-header">
              <p className="streaming-section-label">02 / accounts</p>
              <h2>stream together.</h2>
              <p>
                Follow ENGENE streaming accounts for
                schedules, goals, reminders, and updates.
              </p>
            </div>

            <div className="streaming-cards">
              <a
                href="#"
                className="streaming-card streaming-card-feature"
              >
                <span className="streaming-card-number">01</span>
                <div>
                  <p className="streaming-card-label">spotify</p>
                  <h3>EN on Spotify</h3>
                  <p>streaming playlists and Spotify resources.</p>
                </div>
                <span className="streaming-card-arrow">↗</span>
              </a>

              <a
                href="#"
                className="streaming-card"
              >
                <span className="streaming-card-number">02</span>
                <div>
                  <p className="streaming-card-label">stationhead</p>
                  <h3>EN Stationhead</h3>
                  <p>find ENGENE streaming parties.</p>
                </div>
                <span className="streaming-card-arrow">↗</span>
              </a>

              <a
                href="#"
                className="streaming-card"
              >
                <span className="streaming-card-number">03</span>
                <div>
                  <p className="streaming-card-label">youtube</p>
                  <h3>EN on YouTube</h3>
                  <p>YouTube streaming resources and updates.</p>
                </div>
                <span className="streaming-card-arrow">↗</span>
              </a>

              <a
                href="#"
                className="streaming-card streaming-card-wide"
              >
                <span className="streaming-card-number">04</span>
                <div>
                  <p className="streaming-card-label">x / twitter</p>
                  <h3>Streaming Updates</h3>
                  <p>
                    Follow streaming goals, reminders, and comeback updates.
                  </p>
                </div>
                <span className="streaming-card-arrow">↗</span>
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

export default Streaming;
