export const resourceFactoryDefinitions = [
  {
    "name": "projects",
    "table": "projects"
  },
  {
    "name": "agent_events",
    "table": "agent_events"
  }
] as const;

export function makeProjectsFixture(overrides: Record<string, unknown> = {}) {
  return { ...{
  "name": "Seed name",
  "slug": "Seed slug"
}, ...overrides };
}

export function makeAgentEventsFixture(overrides: Record<string, unknown> = {}) {
  return { ...{
  "type": "Seed type",
  "payload": {}
}, ...overrides };
}
