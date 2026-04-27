import { A, useParams } from "@solidjs/router";
import { Meta, Title } from "@solidjs/meta";
import {
  ArrowLeft,
  Bot,
  Code2,
  Folder,
  GitBranch,
  HelpCircle,
  Home,
  Image,
  LayoutGrid,
  MessageCircle,
  MonitorPlay,
  PanelRightClose,
  Plus,
  Send,
  Sparkles,
} from "lucide-solid";
import { createSignal } from "solid-js";

function readableProjectName(id: string | undefined) {
  if (!id || id === "demo") return "Social Post Ratings";
  return id
    .split("-")
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ProjectStudioRoute() {
  const params = useParams();
  const [controlsVisible, setControlsVisible] = createSignal(true);
  const projectName = () => readableProjectName(params.id);

  return (
    <main class="app-frame app-frame--studio">
      <Title>{projectName()} Studio</Title>
      <Meta name="robots" content="noindex" />
      <section class="studio-shell" classList={{ "studio-shell--compact": !controlsVisible() }}>
        <aside class="mini-rail" aria-label="Studio navigation">
          <span class="mini-rail__logo">s</span>
          <A href="/" class="mini-rail__button" aria-label="Home"><Home size={21} /></A>
          <A href="/projects/new" class="mini-rail__button" aria-label="New app"><Plus size={22} /></A>
          <A href="/projects/demo" class="mini-rail__button mini-rail__button--active" aria-label="Studio"><MessageCircle size={21} /></A>
          <span class="mini-rail__button" aria-label="Files"><Folder size={21} /></span>
          <span class="mini-rail__button" aria-label="Screens"><LayoutGrid size={21} /></span>
          <span class="mini-rail__spacer" />
          <span class="mini-rail__button" aria-label="Help"><HelpCircle size={21} /></span>
        </aside>

        <aside class="studio-pane chat-pane surface">
          <header class="pane-header">
            <div>
              <p class="eyebrow">Chat</p>
              <h1>ContentRank</h1>
              <p>Tell the builder what to change next.</p>
            </div>
            <A href="/" class="pill" aria-label="Back to dashboard"><ArrowLeft size={15} /> Dashboard</A>
          </header>

          <div class="message-stream">
            <article class="message message--builder">
              <strong><Bot size={15} /> Stylyf agent</strong>
              <p>
                I opened the first draft. Tell me what feels wrong, missing, or too plain.
              </p>
            </article>
            <article class="message message--user">
              <strong>Team brief</strong>
              <p>
                Make this feel like IMDb for user-generated social posts: ratings, submissions, leaderboard, and a clean
                moderation queue.
              </p>
            </article>
          </div>

          <form class="composer" onSubmit={event => event.preventDefault()}>
            <label class="field-label">
              Next instruction
              <textarea
                class="input-field input-field--textarea"
                placeholder="Example: Make the leaderboard more editorial and add a clear submit-post button above the fold."
              />
            </label>
            <div class="button-row">
              <button class="button" type="submit">Send to builder <Send size={17} /></button>
              <button class="button button--quiet" type="button">Attach reference <Image size={17} /></button>
            </div>
          </form>
        </aside>

        <section class="studio-pane preview-pane surface">
          <header class="pane-header">
            <div>
              <p class="eyebrow">Preview</p>
              <h2>ContentRank</h2>
              <p>Inspect the app while you chat.</p>
            </div>
            <div class="button-row">
              <button class="button button--quiet" type="button"><MonitorPlay size={17} /> Refresh</button>
              <button class="button" type="button"><Sparkles size={17} /> Screenshot review</button>
            </div>
          </header>

          <div class="preview-stage">
            <div class="browser-chrome" aria-label="Generated app preview mock">
              <div class="browser-bar">
                <span class="browser-dot" />
                <span class="browser-dot" />
                <span class="browser-dot" />
                <span class="browser-url">localhost:5173/social-post-ratings</span>
              </div>
              <div class="preview-artboard">
                <div class="mock-hero">
                  <span class="pill pill--coral">Community ratings</span>
                  <h3>The best social posts, ranked by people with taste.</h3>
                  <p class="body-copy">
                    Submit a TikTok, Instagram post, or tweet. The community rates originality, clarity, and cultural
                    spark.
                  </p>
                  <div class="button-row">
                    <span class="button">Submit a post</span>
                    <span class="button button--quiet">View leaderboard</span>
                  </div>
                </div>
                <div class="mock-grid">
                  <div class="mock-card"><span class="pill">9.2</span></div>
                  <div class="mock-card"><span class="pill">8.8</span></div>
                  <div class="mock-card"><span class="pill">8.5</span></div>
                </div>
              </div>
            </div>
          </div>

          <footer class="preview-footer">
            <span class="pill"><GitBranch size={15} /> Last commit pushed</span>
            <span class="pill pill--coral">Ready for another instruction</span>
          </footer>
        </section>

        <aside class="studio-pane control-rail surface" aria-label="Project controls">
          <header class="pane-header">
            <div>
              <p class="eyebrow">Controls</p>
              <h2>Shape</h2>
              <p>Optional details.</p>
            </div>
            <button
              class="button button--quiet"
              type="button"
              onClick={() => setControlsVisible(value => !value)}
              aria-pressed={!controlsVisible()}
            >
              <PanelRightClose size={17} />
            </button>
          </header>

          <div class="control-list">
            <section class="control-card">
              <h3>App outline</h3>
              <label class="field-label">
                Direction
                <input class="input-field" value="Editorial rating site" />
              </label>
              <span class="pill pill--coral">Social posts</span>
            </section>

            <section class="control-card">
              <h3>Screens</h3>
              <ul>
                <li>Home</li>
                <li>Submit</li>
                <li>Leaderboard</li>
                <li>Moderation</li>
              </ul>
              <button class="button button--ink" type="button"><Code2 size={17} /> Edit details</button>
            </section>

            <section class="control-card">
              <h3>Activity</h3>
              <div class="timeline">
                <div class="timeline-item">
                  <span class="timeline-dot" />
                  <p>Project scaffolded and committed.</p>
                </div>
                <div class="timeline-item">
                  <span class="timeline-dot" />
                  <p>Preview started for screenshot review.</p>
                </div>
                <div class="timeline-item">
                  <span class="timeline-dot" />
                  <p>Waiting on next product instruction.</p>
                </div>
              </div>
            </section>

            <section class="control-card surface--ink">
              <h3 style={{ color: "var(--builder-paper)" }}>Handoff</h3>
              <p style={{ color: "color-mix(in oklab, var(--builder-paper) 72%, transparent)" }}>
                When the draft feels right, send it for developer review.
              </p>
            </section>
          </div>
        </aside>
      </section>
    </main>
  );
}
