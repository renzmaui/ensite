import SiteNav from "./components/SiteNav";
import Breadcrumb from "./components/Breadcrumb";
import "./styles/voting.css";

function Voting() {
  return (
    <div className="ensite-page">
      <SiteNav current="enhub" />

      <main className="ensite-content voting-content">
        <Breadcrumb
          parent="ENHUB"
          parentPath="/enhub"
          current="Voting Resources"
        />

        <h1>
          voting
          <br />
          <span>resources.</span>
        </h1>

        <p className="voting-intro">
          guides, apps, and accounts to help ENGENEs
          <br />
          vote for ENHYPEN together.
        </p>

        <div className="voting-board">
          {/* VOTING GUIDE */}
          <section className="voting-section voting-guide">
            <div className="voting-section-header">
              <p className="voting-section-label">01 / guide</p>
              <h2>vote together.</h2>
              <p>
                Simple guides for the voting platforms ENGENEs
                use to support ENHYPEN.
              </p>
            </div>

            <div className="voting-cards">
              <a
                href="/enhub/voting/guide"
                className="voting-card voting-card-feature"
              >
                <span className="voting-card-number">01</span>

                <div>
                  <p className="voting-card-label">start here</p>
                  <h3>Voting Guide</h3>
                  <p>
                    Learn how voting works and where to vote
                    during comeback and award seasons.
                  </p>
                </div>

                <span className="voting-card-arrow">↗</span>
              </a>

              <a
                href="/enhub/voting/apps"
                className="voting-card"
              >
                <span className="voting-card-number">02</span>

                <div>
                  <p className="voting-card-label">apps</p>
                  <h3>Voting Apps</h3>
                  <p>
                    Find the apps currently being used for
                    ENHYPEN voting.
                  </p>
                </div>

                <span className="voting-card-arrow">↗</span>
              </a>

              <a
                href="/enhub/voting/accounts"
                className="voting-card"
              >
                <span className="voting-card-number">03</span>

                <div>
                  <p className="voting-card-label">accounts</p>
                  <h3>Voting Accounts</h3>
                  <p>
                    Follow ENGENE voting accounts for goals,
                    reminders, and updates.
                  </p>
                </div>

                <span className="voting-card-arrow">↗</span>
              </a>
            </div>
          </section>

          {/* VOTING UPDATES */}
          <section className="voting-section voting-updates">
            <div className="voting-section-header">
              <p className="voting-section-label">02 / updates</p>
              <h2>every vote counts.</h2>
              <p>
                Stay updated with voting goals, deadlines,
                reminders, and important announcements.
              </p>
            </div>

            <div className="voting-cards">
              <a
                href="/enhub/voting/reminders"
                className="voting-card voting-card-feature"
              >
                <span className="voting-card-number">01</span>

                <div>
                  <p className="voting-card-label">reminders</p>
                  <h3>Voting Reminders</h3>
                  <p>
                    Keep track of voting periods, deadlines,
                    and daily voting tasks.
                  </p>
                </div>

                <span className="voting-card-arrow">↗</span>
              </a>

              <a
                href="#"
                className="voting-card voting-card-feed"
              >
                <span className="voting-card-number">02</span>

                <div>
                  <p className="voting-card-label">x / twitter</p>
                  <h3>Voting Updates</h3>
                  <p>
                    ENGENE voting goals and real-time updates.
                  </p>
                </div>

                <span className="voting-card-arrow">↗</span>

                <div className="voting-feed-placeholder">
                  <span>𝕏</span>
                  <small>feed coming soon</small>
                </div>
              </a>

              <a
                href="/enhub/voting/goals"
                className="voting-card voting-card-wide"
              >
                <span className="voting-card-number">03</span>

                <div>
                  <p className="voting-card-label">goals</p>
                  <h3>Current Voting Goals</h3>
                  <p>
                    See what ENGENEs are working toward right now.
                  </p>
                </div>

                <span className="voting-card-arrow">↗</span>
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
export default Voting;