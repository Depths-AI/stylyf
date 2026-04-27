import { A } from "@solidjs/router";
import { Meta, Title } from "@solidjs/meta";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-solid";

export default function NewProjectRoute() {
  return (
    <main class="app-frame">
      <Title>Create an app draft</Title>
      <Meta name="robots" content="noindex" />
      <section class="new-project-shell">
        <div class="new-project-copy surface--ink">
          <A href="/" class="pill">← Back to dashboard</A>
          <p class="eyebrow">New app</p>
          <h1 class="display-title">Give the idea a name.</h1>
          <p class="body-copy" style={{ color: "color-mix(in oklab, var(--builder-paper) 72%, transparent)" }}>
            Keep it short. You can describe the actual product in the studio.
          </p>
        </div>

        <form class="new-project-form surface" onSubmit={event => event.preventDefault()}>
          <p class="eyebrow">Create</p>
          <label class="field-label">
            App name
            <input class="input-field" name="name" value="Social Post Ratings" autocomplete="off" />
          </label>
          <div class="button-row">
            <A href="/projects/demo" class="button">Create and open studio <ArrowRight size={18} /></A>
            <A href="/" class="button button--quiet"><ArrowLeft size={18} /> Cancel</A>
          </div>

          <div class="prompt-examples" aria-label="Good first prompts">
            <span class="pill pill--coral"><Sparkles size={15} /> Example directions</span>
            <p class="prompt-example">“Make this a public rating site for user-submitted TikToks and Instagram posts.”</p>
            <p class="prompt-example">“Create an internal queue where designers submit visuals and reviewers leave notes.”</p>
          </div>
        </form>
      </section>
    </main>
  );
}
