import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve("webknife");

const wait = ms => ({ action: "wait", ms });
const click = selector => ({ action: "click", selector });
const type = (selector, text, delayMs = 20) => ({ action: "type", selector, text, delayMs });
const press = key => ({ action: "press", key });
const waitForSelector = (selector, timeoutMs = 20000) => ({ action: "waitForSelector", selector, timeoutMs });

function visitComponent(slug, extraSteps = []) {
  return [
    click(`[data-sidebar-component='${slug}']`),
    wait(900),
    waitForSelector(`[data-registry-card='${slug}']`),
    wait(250),
    click(`[data-registry-card='${slug}'] [data-pane-trigger='source']`),
    waitForSelector(`[data-registry-card='${slug}'] pre code`),
    click(`[data-registry-card='${slug}'] [data-pane-trigger='preview']`),
    waitForSelector(`[data-demo='${slug}']`),
    ...extraSteps,
  ];
}

const themeSweep = [
  waitForSelector("input[type='search']"),
  waitForSelector("[data-theme-preset-option='stylyf']"),
];

for (const preset of ["stylyf", "graphite", "citrus", "ocean"]) {
  for (const mode of ["light", "dark"]) {
    themeSweep.push(
      click(`[data-theme-preset-option='${preset}']`),
      click(`[data-theme-segment='${mode}']`),
      wait(500),
      click("[data-sidebar-component='button']"),
      wait(500),
      waitForSelector("[data-demo='button']"),
      click("[data-sidebar-component='text-field']"),
      wait(500),
      waitForSelector("[data-demo='text-field']"),
    );
  }
}

const tier1Tour = [
  waitForSelector("input[type='search']"),
  waitForSelector("[data-theme-preset-option='ocean']"),
  click("[data-theme-preset-option='ocean']"),
  click("[data-theme-segment='dark']"),
  wait(600),

  ...visitComponent("button", [click("[data-demo='button'] button")]),
  ...visitComponent("icon-button", [click("[data-demo='icon-button'] button[aria-label='Create']")]),
  ...visitComponent("link-button"),
  ...visitComponent("toggle", [click("[data-demo='toggle'] button")]),
  ...visitComponent("toggle-group", [click("[data-demo='toggle-group'] [role='toolbar'] button:nth-of-type(2)")]),
  ...visitComponent("breadcrumb"),
  ...visitComponent("pagination", [click("[data-demo='pagination'] button[data-current='false']")]),

  ...visitComponent("text-field", [type("[data-demo='text-field'] input[type='text']", "Stylyf tokens")]),
  ...visitComponent("text-area", [type("[data-demo='text-area'] textarea", " Webknife review")]),
  ...visitComponent("number-field", [click("[data-demo='number-field'] button[aria-label='Increase value']")]),
  ...visitComponent("otp-field", [click("[data-demo='otp-field'] input[aria-label='Digit 1']"), type("[data-demo='otp-field'] input[aria-label='Digit 1']", "1")]),
  ...visitComponent("checkbox", [click("[data-demo='checkbox'] label")]),
  ...visitComponent("radio-group", [click("[data-demo='radio-group'] label:nth-of-type(1)")]),
  ...visitComponent("switch", [click("[data-demo='switch'] button[role='switch']")]),
  ...visitComponent("select", [click("[data-demo='select'] select"), press("ArrowDown"), press("Enter")]),
  ...visitComponent("combobox", [
    click("[data-demo='combobox'] input[role='combobox']"),
    type("[data-demo='combobox'] input[role='combobox']", "Sec"),
    press("ArrowDown"),
    press("Enter"),
  ]),
  ...visitComponent("slider", [click("[data-demo='slider'] input[type='range']"), press("ArrowRight")]),
  ...visitComponent("calendar", [click("[data-demo='calendar'] button[aria-pressed='false']")]),
  ...visitComponent("date-picker", [
    click("[data-demo='date-picker'] button[aria-label='Toggle date picker']"),
    waitForSelector("[data-demo='date-picker'] button[aria-pressed='false']"),
    click("[data-demo='date-picker'] button[aria-pressed='false']"),
  ]),

  ...visitComponent("command-menu", [
    click("[data-demo-action='open-command-menu']"),
    waitForSelector("[role='dialog'] input"),
    type("[role='dialog'] input", "bill"),
    press("ArrowDown"),
    press("Enter"),
  ]),
  ...visitComponent("tabs", [click("[data-demo='tabs'] [role='tab']:nth-of-type(2)")]),
  ...visitComponent("accordion", [click("[data-demo='accordion'] h3 button")]),
  ...visitComponent("collapsible", [click("[data-demo='collapsible'] button[aria-expanded]")]),
  ...visitComponent("dialog", [
    click("[data-demo-action='open-dialog']"),
    waitForSelector("[role='dialog']"),
    click("[role='dialog'] button[aria-label='Close dialog']"),
  ]),
  ...visitComponent("alert-dialog", [
    click("[data-demo-action='open-alert-dialog']"),
    waitForSelector("[role='alertdialog']"),
    click(".ui-overlay"),
  ]),
  ...visitComponent("drawer", [
    click("[data-demo-action='open-drawer']"),
    waitForSelector("[role='dialog']"),
    click("[role='dialog'] button[aria-label='Close drawer']"),
  ]),
  ...visitComponent("popover", [
    click("[data-demo='popover'] button[aria-expanded='false']"),
    waitForSelector("[role='dialog']"),
    click("[data-demo='popover'] button[aria-expanded='true']"),
  ]),
  ...visitComponent("tooltip", [
    click("[data-demo='tooltip'] button"),
    waitForSelector("[role='tooltip']"),
  ]),
  ...visitComponent("dropdown-menu", [
    click("[data-demo='dropdown-menu'] button[aria-haspopup='menu']"),
    waitForSelector("[role='menu']"),
    click("[role='menuitem']"),
  ]),
  ...visitComponent("context-menu", [
    click("[data-demo='context-menu'] [tabindex='0']"),
    press("ContextMenu"),
    waitForSelector("[role='menu']"),
    click("[role='menuitem']"),
  ]),
  ...visitComponent("menubar", [
    click("[data-demo='menubar'] [role='menubar'] > button"),
    waitForSelector("[role='menu']"),
    click("[role='menuitem']"),
  ]),

  ...visitComponent("progress"),
  ...visitComponent("badge", [click("[data-demo='badge'] button[aria-label='Remove badge']")]),
  ...visitComponent("avatar"),
  ...visitComponent("toast", [click("[data-demo='toast'] button[aria-label='Dismiss notification']")]),
  ...visitComponent("skeleton"),
  ...visitComponent("separator"),
  ...visitComponent("table", [click("[data-demo='table'] tbody tr")]),
];

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "tier1-theme-sweep.yaml"), `${JSON.stringify(themeSweep, null, 2)}\n`);
writeFileSync(resolve(outDir, "tier1-tour.yaml"), `${JSON.stringify(tier1Tour, null, 2)}\n`);

console.log("Generated webknife Tier 1 step files.");
