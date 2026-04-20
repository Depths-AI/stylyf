import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve("webknife", "form-inputs");

const wait = ms => ({ action: "wait", ms });
const click = selector => ({ action: "click", selector });
const type = (selector, text, delayMs = 20) => ({ action: "type", selector, text, delayMs });
const press = key => ({ action: "press", key });
const waitForSelector = (selector, timeoutMs = 20000) => ({ action: "waitForSelector", selector, timeoutMs });

function baseSteps(slug) {
  return [
    waitForSelector("input[type='search']"),
    waitForSelector("[data-theme-preset-option='stylyf']"),
    click("[data-theme-preset-option='stylyf']"),
    click("[data-theme-segment='light']"),
    wait(450),
    click("[data-sidebar-cluster='tier-1-form-inputs']"),
    wait(450),
    click(`[data-sidebar-component='${slug}']`),
    wait(900),
    waitForSelector(`[data-registry-card='${slug}']`),
    click(`[data-registry-card='${slug}'] [data-pane-trigger='source']`),
    waitForSelector(`[data-registry-card='${slug}'] pre code`),
    click(`[data-registry-card='${slug}'] [data-pane-trigger='preview']`),
    waitForSelector(`[data-demo='${slug}']`),
  ];
}

const flows = {
  "text-field": [
    ...baseSteps("text-field"),
    type("[data-demo='text-field'] [data-demo-slot='workspace-name'] input", "Registry Alpha"),
    wait(250),
    click("[data-demo='text-field'] [data-demo-slot='workspace-name'] button[aria-label='Clear field']"),
    wait(250),
    type("[data-demo='text-field'] [data-demo-slot='owner-email'] input[type='email']", "admin@stylyf.com"),
    wait(250),
  ],
  "text-area": [
    ...baseSteps("text-area"),
    click("[data-demo='text-area'] [data-demo-slot='release-note'] textarea"),
    press("End"),
    type("[data-demo='text-area'] [data-demo-slot='release-note'] textarea", " Added final launch notes."),
    wait(250),
    type("[data-demo='text-area'] [data-demo-slot='admin-note'] textarea", "Requires manual approval by security."),
    wait(250),
  ],
  "number-field": [
    ...baseSteps("number-field"),
    click("[data-demo='number-field'] [data-demo-slot='team-seats'] button[aria-label='Increase value']:nth-of-type(2)"),
    wait(250),
    click("[data-demo='number-field'] [data-demo-slot='team-seats'] button[aria-label='Decrease value']:nth-of-type(1)"),
    wait(250),
    click("[data-demo='number-field'] [data-demo-slot='budget-cap'] input"),
    press("End"),
    press("Backspace"),
    press("Backspace"),
    type("[data-demo='number-field'] [data-demo-slot='budget-cap'] input", "50"),
    wait(250),
  ],
  "otp-field": [
    ...baseSteps("otp-field"),
    type("[data-demo='otp-field'] [data-demo-slot='verification-code'] input[aria-label='Digit 1']", "1"),
    wait(250),
    type("[data-demo='otp-field'] [data-demo-slot='verification-code'] input[aria-label='Digit 2']", "2"),
    wait(250),
    type("[data-demo='otp-field'] [data-demo-slot='verification-code'] input[aria-label='Digit 3']", "3"),
    wait(250),
    type("[data-demo='otp-field'] [data-demo-slot='verification-code'] input[aria-label='Digit 4']", "4"),
    wait(250),
  ],
  checkbox: [
    ...baseSteps("checkbox"),
    click("[data-demo='checkbox'] [data-demo-slot='product-digest'] label"),
    wait(250),
    click("[data-demo='checkbox'] [data-demo-slot='child-workspaces'] label"),
    wait(250),
    click("[data-demo='checkbox'] [data-demo-slot='security-acknowledgment'] label"),
    wait(250),
  ],
  "radio-group": [
    ...baseSteps("radio-group"),
    click("[data-demo='radio-group'] [data-demo-slot='workspace-plan'] label:has(input[value='pro'])"),
    wait(250),
    click("[data-demo='radio-group'] [data-demo-slot='workspace-plan'] label:has(input[value='enterprise'])"),
    wait(250),
    press("ArrowLeft"),
    wait(250),
  ],
  switch: [
    ...baseSteps("switch"),
    click("[data-demo='switch'] [data-demo-slot='immediate-publish'] button[role='switch']"),
    wait(250),
    click("[data-demo='switch'] [data-demo-slot='lock-external-sharing'] button[role='switch']"),
    wait(250),
    click("[data-demo='switch'] [data-demo-slot='immediate-publish'] button[role='switch']"),
    wait(250),
  ],
  select: [
    ...baseSteps("select"),
    click("[data-demo='select'] [data-demo-slot='surface-preset'] select"),
    press("ArrowDown"),
    press("ArrowDown"),
    press("Enter"),
    wait(250),
    click("[data-demo='select'] [data-demo-slot='environment'] select"),
    press("ArrowDown"),
    press("ArrowDown"),
    press("Enter"),
    wait(250),
  ],
  combobox: [
    ...baseSteps("combobox"),
    type("[data-demo='combobox'] [data-demo-slot='workspace-search'] input", "ops"),
    wait(250),
    press("ArrowDown"),
    wait(250),
    press("Enter"),
    wait(250),
    click("[data-demo='combobox'] [data-demo-slot='workspace-search'] button[aria-label='Clear combobox']"),
    wait(250),
  ],
  slider: [
    ...baseSteps("slider"),
    click("[data-demo='slider'] [data-demo-slot='confidence-threshold'] input[type='range']"),
    press("ArrowRight"),
    press("ArrowRight"),
    wait(250),
    click("[data-demo='slider'] [data-demo-slot='usage-band'] input[type='range']:nth-of-type(1)"),
    press("ArrowRight"),
    wait(250),
    click("[data-demo='slider'] [data-demo-slot='usage-band'] input[type='range']:nth-of-type(2)"),
    press("ArrowLeft"),
    wait(250),
  ],
  calendar: [
    ...baseSteps("calendar"),
    click("[data-demo='calendar'] [data-demo-slot='single-date'] button[aria-label='Next month']"),
    wait(250),
    click("[data-demo='calendar'] [data-demo-slot='single-date'] button[aria-pressed='false']"),
    wait(250),
    click("[data-demo='calendar'] [data-demo-slot='date-range'] button[aria-label='Next month']"),
    wait(250),
    click("[data-demo='calendar'] [data-demo-slot='date-range'] button[aria-pressed='false']"),
    wait(250),
    click("[data-demo='calendar'] [data-demo-slot='date-range'] button[aria-pressed='false']"),
    wait(250),
  ],
  "date-picker": [
    ...baseSteps("date-picker"),
    click("[data-demo='date-picker'] [data-demo-slot='launch-date'] button[aria-label='Toggle date picker']"),
    wait(250),
    click("[data-demo='date-picker'] [data-demo-slot='launch-date'] button[aria-label='Next month']"),
    wait(250),
    click("[data-demo='date-picker'] [data-demo-slot='launch-date'] button[aria-pressed='false']"),
    wait(250),
    click("[data-demo='date-picker'] [data-demo-slot='campaign-window'] button[aria-label='Toggle date picker']"),
    wait(250),
    click("[data-demo='date-picker'] [data-demo-slot='campaign-window'] button[aria-pressed='false']"),
    wait(250),
    click("[data-demo='date-picker'] [data-demo-slot='campaign-window'] button[aria-pressed='false']"),
    wait(250),
  ],
};

mkdirSync(outDir, { recursive: true });

for (const [slug, steps] of Object.entries(flows)) {
  writeFileSync(resolve(outDir, `${slug}.yaml`), `${JSON.stringify(steps, null, 2)}\n`);
}

console.log(`Generated ${Object.keys(flows).length} Webknife flows in ${outDir}`);
