# Schema Reference

A living, field-by-field reference for every major `.usm` type. **Sourced from the [v1 JSON Schema](https://usm.dev/schema/v1.json)** — type, required, constraints, and descriptions are never hand-maintained here.

::: tip How to use this page
Scan the summary tables for a quick answer, then expand a field for intent, YAML example, generator/MCP impact, and best practices.
:::

## File types at a glance

| `$type` | Purpose | Required header fields |
|--------|---------|------------------------|
| `system` | Whole-system map (identity, services, features index) | `$schema`, `$id`, `$type`, `$version`, `summary`, `identity` |
| `service` | One deployable service or shared package | `$schema`, `$id`, `$type`, `$version`, `summary`, `$system` |
| `feature` | One capability with flows, contracts, tests | `$schema`, `$id`, `$type`, `$version`, `summary`, `$system`, `$service`, `intent` |
| `feedback` | Structured agent/human feedback entry | `$schema`, `$id`, `$type`, `$version`, `summary`, `kind`, `severity`, `status`, `reported_by` |

## system Files

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | `"https://usm.dev/schema/v1.json"` | yes |  |
| `$id` | string | yes |  |
| `$type` | `"system"` | yes |  |
| `$version` | integer | yes |  |
| `$last_updated` | string | — |  |
| `summary` | string | yes |  |
| `status` | `planned` \| `in-progress` \| `built` \| `deprecated` | — | Implementation status: planned (no code yet), in-progress (partial code), built  |
| `version` | string | — | The consuming project's OWN release version (e.g. '2.3.1'). NOT the USM tool ver |
| `usm_version` | string | — | The USM tool version this project was last aligned with via `usm upgrade` (e.g.  |
| `identity` | object | yes |  |
| `index` | object[] | — |  |
| `services` | object[] | — |  |
| `auth_schemes` | object[] | — | Named authentication schemes referenced by routes and services. |
| `apis` | object[] | — |  |
| `data` | object[] | — |  |
| `infrastructure` | object | — |  |
| `deployment` | object | — |  |
| `operations` | object | — |  |
| `policies` | object | — |  |
| `risks` | object[] | — |  |
| `roadmap` | object[] | — |  |
| `agent_context` | string | — | Markdown content for AI agent context — critical distinctions, usage modes, etc. |
| `conventions` | string[] | — | Platform-wide conventions that all agents must follow |
| `mandatory_reading` | object[] | — | Documents that must be read before any work |
| `nextjs_breaking_changes` | string | — | Markdown content describing Next.js 16 breaking changes (middleware→proxy, Turbo |
| `principles` | object[] | — | TOGAF Architecture Principles — the rules and values that govern all architectur |
| `roles` | object[] | — | User roles — who uses this system and what they need from the docs and tools. |
| `local_development` | object | — | Local development workflow — commands, quirks, log locations, and external servi |
| `feedback` | object | — | Agent feedback policy — governs how AI agents report bugs and improvements. Set  |
| `reference_pages` | [`referencePage`](#referencepage)[] | — | Reference pages declared on system.usm — rendered by the generic content-block r |
| `design_pages` | [`designPage`](#designpage)[] | — | Design section pages with inline content blocks — enriches the technical design  |
| `stakeholders` | object[] | — | Key stakeholders — clients, developers, business owners involved with or impacte |
| `assumptions` | string[] | — | Key assumptions related to the project (e.g. timelines, milestones, external dep |
| `non_functional` | object | — | Non-functional requirements — performance, scalability, security, reliability, m |
| `testing_strategy` | object | — | Project-level testing strategy — performance, security, and automated testing po |
| `error_tracking` | object | — | Error tracking tool and configuration for capturing and handling application err |
| `backup_recovery` | object | — | System-level backup and disaster recovery strategy. |
| `security_stack` | object | — | Defense-in-depth security stack — first line and last line of defense. |

### Field details

::: details $schema (required, "https://usm.dev/schema/v1.json")

#### `$schema`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `"https://usm.dev/schema/v1.json"`
- Required: yes
- const: `"https://usm.dev/schema/v1.json"`

**YAML example**

```yaml
$schema: "https://usm.dev/schema/v1.json"
```

**Impact**

Pins the JSON Schema version used by `usm validate`.

:::

::: details $id (required, string)

#### `$id`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
$id: "example-value"
```

**Impact**

Stable identity used by MCP tools, cross-refs, and generators.

**Best practice**

Format `org/name`. Immutable after write — never rename casually.

:::

::: details $type (required, "system")

#### `$type`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `"system"`
- Required: yes
- const: `"system"`

**YAML example**

```yaml
$type: "system"
```

**Impact**

Discriminator for validation (`oneOf`) and type-specific generators.

:::

::: details $version (required, integer)

#### `$version`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: integer
- Required: yes

**YAML example**

```yaml
$version: 1
```

**Impact**

Schema format version; mismatch produces a validation warning.

:::

::: details $last_updated (optional, string)

#### `$last_updated`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
$last_updated: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details summary (required, string)

#### `summary`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
summary: |
  One or two sentences describing this.
```

**Impact**

Rendered on every generated doc page; used by MCP `usm_list` / `usm_search`.

**Best practice**

Keep to 1–3 sentences. Lead with the outcome, not the implementation.

:::

::: details status (optional, planned \/ in-progress \/ built \/ deprecated)

#### `status`

**Description and intent**

Implementation status: planned (no code yet), in-progress (partial code), built (code exists), deprecated (replaced by something else)

**Type and constraints**

- Type: `planned` \| `in-progress` \| `built` \| `deprecated`
- Required: no
- enum: `planned`, `in-progress`, `built`, `deprecated`
- default: `"built"`

**YAML example**

```yaml
status: "planned"
```

**Impact**

Drives help-docs filtering (only `built`/`public` appear); badges in sidebar.

**Best practice**

Only advance planned → in-progress → built → deprecated. Use MCP status tools.

:::

::: details version (optional, string)

#### `version`

**Description and intent**

The consuming project's OWN release version (e.g. '2.3.1'). NOT the USM tool version. Distinct from $version (schema format) and usm_version (tool alignment).

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
version: "example-value"
```

**Impact**

Project's own release version — not the USM tool version.

:::

::: details usm_version (optional, string)

#### `usm_version`

**Description and intent**

The USM tool version this project was last aligned with via `usm upgrade` (e.g. '0.1.0'). Used to detect stale projects and offer new capabilities. Absent = never upgraded (treated as 0.0.0). Do not confuse with `version` (the project's own release) or `$version` (the schema format).

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
usm_version: "example-value"
```

**Impact**

Compared by `usm upgrade` against the installed tool version.

**Best practice**

Written only by `usm upgrade`. Do not hand-edit unless you know why.

:::

::: details identity (required, object)

#### `identity`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: yes

**YAML example**

```yaml
identity:
  # nested fields…
```

**Impact**

Homepage hero, VitePress title/description, footer/repo links.

:::

::: details index (optional, object[])

#### `index`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
index:
  - example-item
```

**Impact**

Feature index, sidebar feature groups, getting-started example selection.

:::

::: details services (optional, object[])

#### `services`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
services:
  - example-item
```

**Impact**

Service overview pages + homepage service lists.

:::

::: details auth_schemes (optional, object[])

#### `auth_schemes`

**Description and intent**

Named authentication schemes referenced by routes and services.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
auth_schemes:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details apis (optional, object[])

#### `apis`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
apis:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details data (optional, object[])

#### `data`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
data:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details infrastructure (optional, object)

#### `infrastructure`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
infrastructure:
  # nested fields…
```

**Impact**

Deployment docs and ArchiMate/TOGAF outputs.

:::

::: details deployment (optional, object)

#### `deployment`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
deployment:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details operations (optional, object)

#### `operations`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
operations:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details policies (optional, object)

#### `policies`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
policies:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details risks (optional, object[])

#### `risks`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
risks:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details roadmap (optional, object[])

#### `roadmap`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
roadmap:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details agent_context (optional, string)

#### `agent_context`

**Description and intent**

Markdown content for AI agent context — critical distinctions, usage modes, etc.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
agent_context: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details conventions (optional, string[])

#### `conventions`

**Description and intent**

Platform-wide conventions that all agents must follow

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
conventions:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details mandatory_reading (optional, object[])

#### `mandatory_reading`

**Description and intent**

Documents that must be read before any work

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
mandatory_reading:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details nextjs_breaking_changes (optional, string)

#### `nextjs_breaking_changes`

**Description and intent**

Markdown content describing Next.js 16 breaking changes (middleware→proxy, Turbopack, etc.)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
nextjs_breaking_changes: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details principles (optional, object[])

#### `principles`

**Description and intent**

TOGAF Architecture Principles — the rules and values that govern all architecture decisions.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
principles:
  - example-item
```

**Impact**

Homepage feature cards + AGENTS.md principles section.

:::

::: details roles (optional, object[])

#### `roles`

**Description and intent**

User roles — who uses this system and what they need from the docs and tools.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
roles:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details local_development (optional, object)

#### `local_development`

**Description and intent**

Local development workflow — commands, quirks, log locations, and external services required to run the platform on a developer's machine.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
local_development:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details feedback (optional, object)

#### `feedback`

**Description and intent**

Agent feedback policy — governs how AI agents report bugs and improvements. Set up via `usm init`. Drives the Feedback Protocol block rendered into all agent-facing rules files.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
feedback:
  # nested fields…
```

**Impact**

Agent Feedback Protocol in all rules files; `usm upgrade` / `usm feedback`.

**Best practice**

Default policy is `human-gate`. Never invent ad-hoc `bugs.md` files.

:::

::: details reference_pages (optional, [referencePage](#referencepage)[])

#### `reference_pages`

**Description and intent**

Reference pages declared on system.usm — rendered by the generic content-block renderer. Replaces bespoke hardcoded generator functions.

**Type and constraints**

- Type: [`referencePage`](#referencepage)[]
- Required: no

**YAML example**

```yaml
reference_pages:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details design_pages (optional, [designPage](#designpage)[])

#### `design_pages`

**Description and intent**

Design section pages with inline content blocks — enriches the technical design document generator's structured data with prose that doesn't fit schema fields. Parallel to reference_pages[].

**Type and constraints**

- Type: [`designPage`](#designpage)[]
- Required: no

**YAML example**

```yaml
design_pages:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details stakeholders (optional, object[])

#### `stakeholders`

**Description and intent**

Key stakeholders — clients, developers, business owners involved with or impacted by the project.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
stakeholders:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details assumptions (optional, string[])

#### `assumptions`

**Description and intent**

Key assumptions related to the project (e.g. timelines, milestones, external dependencies).

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
assumptions:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details non_functional (optional, object)

#### `non_functional`

**Description and intent**

Non-functional requirements — performance, scalability, security, reliability, maintainability targets.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
non_functional:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details testing_strategy (optional, object)

#### `testing_strategy`

**Description and intent**

Project-level testing strategy — performance, security, and automated testing policies beyond per-service testing config.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
testing_strategy:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details error_tracking (optional, object)

#### `error_tracking`

**Description and intent**

Error tracking tool and configuration for capturing and handling application errors.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
error_tracking:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details backup_recovery (optional, object)

#### `backup_recovery`

**Description and intent**

System-level backup and disaster recovery strategy.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
backup_recovery:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details security_stack (optional, object)

#### `security_stack`

**Description and intent**

Defense-in-depth security stack — first line and last line of defense.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
security_stack:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

## service Files

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | `"https://usm.dev/schema/v1.json"` | yes |  |
| `$id` | string | yes |  |
| `$type` | `"service"` | yes |  |
| `$version` | integer | yes |  |
| `$last_updated` | string | — |  |
| `summary` | string | yes |  |
| `name` | string | — | Human-readable display name for this service (e.g., 'Agent X (Tenant)' instead o |
| `$system` | string | yes | Reference to system.usm file (e.g. smith-gray/system) |
| `status` | `planned` \| `in-progress` \| `built` \| `deprecated` | — | Implementation status: planned (no code yet), in-progress (partial code), built  |
| `type` | `web-app` \| `api` \| `worker` \| `idp` \| `llm-gateway` \| `agent-flows` \| `database` \| `cache` \| `queue` | yes |  |
| `runtime` | string | yes |  |
| `port` | integer | — |  |
| `paths` | string[] | — |  |
| `depends_on` | string[] | — |  |
| `dev` | object | — |  |
| `prod` | object | — |  |
| `testing` | object | — |  |
| `security` | object | — |  |
| `risks` | string[] | — |  |
| `future` | string[] | — |  |
| `decisions` | object[] | — |  |
| `modules` | object[] | — |  |
| `project_structure` | string | — | Markdown describing the project's directory layout (app/, lib/, components/, etc |
| `rbac` | object | — |  |
| `tech_stack` | object | — | Detailed tech stack mapping (framework, language, styling, database, auth, etc.) |
| `conventions` | string[] | — | Service-level conventions (import aliases, auth patterns, code rules) |
| `testing_details` | object | — |  |
| `patterns` | object[] | — | Shared patterns used by this service (e.g., prisma-singleton, litellm-proxy, zit |
| `runtime_details` | string | — | Markdown describing the agent runtime architecture (Docker sandbox, config-gener |
| `infrastructure` | object | — | Terraform-managed infrastructure for this service. Extracted by `usm scan infras |

### Field details

::: details $schema (required, "https://usm.dev/schema/v1.json")

#### `$schema`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `"https://usm.dev/schema/v1.json"`
- Required: yes
- const: `"https://usm.dev/schema/v1.json"`

**YAML example**

```yaml
$schema: "https://usm.dev/schema/v1.json"
```

**Impact**

Pins the JSON Schema version used by `usm validate`.

:::

::: details $id (required, string)

#### `$id`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
$id: "example-value"
```

**Impact**

Stable identity used by MCP tools, cross-refs, and generators.

**Best practice**

Format `org/name`. Immutable after write — never rename casually.

:::

::: details $type (required, "service")

#### `$type`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `"service"`
- Required: yes
- const: `"service"`

**YAML example**

```yaml
$type: "service"
```

**Impact**

Discriminator for validation (`oneOf`) and type-specific generators.

:::

::: details $version (required, integer)

#### `$version`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: integer
- Required: yes

**YAML example**

```yaml
$version: 1
```

**Impact**

Schema format version; mismatch produces a validation warning.

:::

::: details $last_updated (optional, string)

#### `$last_updated`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
$last_updated: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details summary (required, string)

#### `summary`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
summary: |
  One or two sentences describing this.
```

**Impact**

Rendered on every generated doc page; used by MCP `usm_list` / `usm_search`.

**Best practice**

Keep to 1–3 sentences. Lead with the outcome, not the implementation.

:::

::: details name (optional, string)

#### `name`

**Description and intent**

Human-readable display name for this service (e.g., 'Agent X (Tenant)' instead of 'tenant'). Falls back to derived from $id if not set.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
name: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details $system (required, string)

#### `$system`

**Description and intent**

Reference to system.usm file (e.g. smith-gray/system)

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
$system: "example-value"
```

**Impact**

Links features/services back to their system file.

:::

::: details status (optional, planned \/ in-progress \/ built \/ deprecated)

#### `status`

**Description and intent**

Implementation status: planned (no code yet), in-progress (partial code), built (code exists), deprecated (replaced by something else)

**Type and constraints**

- Type: `planned` \| `in-progress` \| `built` \| `deprecated`
- Required: no
- enum: `planned`, `in-progress`, `built`, `deprecated`
- default: `"built"`

**YAML example**

```yaml
status: "planned"
```

**Impact**

Drives help-docs filtering (only `built`/`public` appear); badges in sidebar.

**Best practice**

Only advance planned → in-progress → built → deprecated. Use MCP status tools.

:::

::: details type (required, web-app \/ api \/ worker \/ idp \/ llm-gateway \/ agent-flow)

#### `type`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `web-app` \| `api` \| `worker` \| `idp` \| `llm-gateway` \| `agent-flows` \| `database` \| `cache` \| `queue`
- Required: yes
- enum: `web-app`, `api`, `worker`, `idp`, `llm-gateway`, `agent-flows`, `database`, `cache`, `queue`

**YAML example**

```yaml
type: "web-app"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details runtime (required, string)

#### `runtime`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
runtime: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details port (optional, integer)

#### `port`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: integer
- Required: no

**YAML example**

```yaml
port: 1
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details paths (optional, string[])

#### `paths`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
paths:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details depends_on (optional, string[])

#### `depends_on`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
depends_on:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details dev (optional, object)

#### `dev`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
dev:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details prod (optional, object)

#### `prod`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
prod:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details testing (optional, object)

#### `testing`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
testing:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details security (optional, object)

#### `security`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
security:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details risks (optional, string[])

#### `risks`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
risks:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details future (optional, string[])

#### `future`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
future:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details decisions (optional, object[])

#### `decisions`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
decisions:
  - example-item
```

**Impact**

ADR-style decision records in feature docs.

**Best practice**

Record rejected alternatives — future agents will re-propose them otherwise.

:::

::: details modules (optional, object[])

#### `modules`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
modules:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details project_structure (optional, string)

#### `project_structure`

**Description and intent**

Markdown describing the project's directory layout (app/, lib/, components/, etc.)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
project_structure: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details rbac (optional, object)

#### `rbac`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
rbac:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details tech_stack (optional, object)

#### `tech_stack`

**Description and intent**

Detailed tech stack mapping (framework, language, styling, database, auth, etc.)

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
tech_stack:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details conventions (optional, string[])

#### `conventions`

**Description and intent**

Service-level conventions (import aliases, auth patterns, code rules)

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
conventions:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details testing_details (optional, object)

#### `testing_details`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
testing_details:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details patterns (optional, object[])

#### `patterns`

**Description and intent**

Shared patterns used by this service (e.g., prisma-singleton, litellm-proxy, zitadel-oidc)

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
patterns:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details runtime_details (optional, string)

#### `runtime_details`

**Description and intent**

Markdown describing the agent runtime architecture (Docker sandbox, config-generator, warm pool, etc.)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
runtime_details: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details infrastructure (optional, object)

#### `infrastructure`

**Description and intent**

Terraform-managed infrastructure for this service. Extracted by `usm scan infrastructure`.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
infrastructure:
  # nested fields…
```

**Impact**

Deployment docs and ArchiMate/TOGAF outputs.

:::

## feature Files

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | `"https://usm.dev/schema/v1.json"` | yes |  |
| `$id` | string | yes |  |
| `$type` | `"feature"` | yes |  |
| `$version` | integer | yes |  |
| `$last_updated` | string | — |  |
| `summary` | string | yes |  |
| `$system` | string | yes |  |
| `$service` | string | yes |  |
| `status` | `planned` \| `in-progress` \| `built` \| `deprecated` | — | Implementation status: planned (no code yet), in-progress (partial code), built  |
| `intent` | string | yes | 1-3 sentences: the why behind this feature |
| `visibility` | `public` \| `internal` | — | Controls whether this feature appears in help docs (public) or only developer do |
| `decisions` | object[] | — |  |
| `flows` | object[] | — |  |
| `interfaces` | object[] | — |  |
| `contracts` | object[] | — |  |
| `tests` | object[] | — |  |
| `implementation` | object | — |  |
| `see_also` | string[] | — |  |
| `routes` | object[] | — | Routes (pages + API endpoints) that compose this feature |
| `apps` | string[] | — | Apps this feature is deployed in |
| `source` | string | — | How this feature was detected (e.g., 'scan', 'hand-written') |
| `usage` | object[] | — | Command usage examples for this feature |
| `options` | object[] | — | CLI options/flags for this feature |
| `prerequisites` | string[] | — | What needs to exist before using this feature |
| `command` | string | — | The user-facing name shown in reference docs, decoupled from the internal $id gr |
| `reference` | [`referenceBlock`](#referenceblock)[] | — | User-facing reference blocks — rendered after standard feature doc sections. Unl |

### Field details

::: details $schema (required, "https://usm.dev/schema/v1.json")

#### `$schema`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `"https://usm.dev/schema/v1.json"`
- Required: yes
- const: `"https://usm.dev/schema/v1.json"`

**YAML example**

```yaml
$schema: "https://usm.dev/schema/v1.json"
```

**Impact**

Pins the JSON Schema version used by `usm validate`.

:::

::: details $id (required, string)

#### `$id`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
$id: "example-value"
```

**Impact**

Stable identity used by MCP tools, cross-refs, and generators.

**Best practice**

Format `org/name`. Immutable after write — never rename casually.

:::

::: details $type (required, "feature")

#### `$type`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `"feature"`
- Required: yes
- const: `"feature"`

**YAML example**

```yaml
$type: "feature"
```

**Impact**

Discriminator for validation (`oneOf`) and type-specific generators.

:::

::: details $version (required, integer)

#### `$version`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: integer
- Required: yes

**YAML example**

```yaml
$version: 1
```

**Impact**

Schema format version; mismatch produces a validation warning.

:::

::: details $last_updated (optional, string)

#### `$last_updated`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
$last_updated: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details summary (required, string)

#### `summary`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
summary: |
  One or two sentences describing this.
```

**Impact**

Rendered on every generated doc page; used by MCP `usm_list` / `usm_search`.

**Best practice**

Keep to 1–3 sentences. Lead with the outcome, not the implementation.

:::

::: details $system (required, string)

#### `$system`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
$system: "example-value"
```

**Impact**

Links features/services back to their system file.

:::

::: details $service (required, string)

#### `$service`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
$service: "example-value"
```

**Impact**

Groups features under a service for docs and MCP context.

:::

::: details status (optional, planned \/ in-progress \/ built \/ deprecated)

#### `status`

**Description and intent**

Implementation status: planned (no code yet), in-progress (partial code), built (code exists), deprecated (replaced by something else)

**Type and constraints**

- Type: `planned` \| `in-progress` \| `built` \| `deprecated`
- Required: no
- enum: `planned`, `in-progress`, `built`, `deprecated`
- default: `"built"`

**YAML example**

```yaml
status: "planned"
```

**Impact**

Drives help-docs filtering (only `built`/`public` appear); badges in sidebar.

**Best practice**

Only advance planned → in-progress → built → deprecated. Use MCP status tools.

:::

::: details intent (required, string)

#### `intent`

**Description and intent**

1-3 sentences: the why behind this feature

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
intent: |
  One or two sentences describing this.
```

**Impact**

Feature docs lead with intent; agents use it to understand *why* before building.

**Best practice**

Answer *why this exists* — not *how it works*. Agents read this first.

:::

::: details visibility (optional, public \/ internal)

#### `visibility`

**Description and intent**

Controls whether this feature appears in help docs (public) or only developer docs (internal). Default: internal.

**Type and constraints**

- Type: `public` \| `internal`
- Required: no
- enum: `public`, `internal`

**YAML example**

```yaml
visibility: "public"
```

**Impact**

Overrides status for help-docs inclusion (`public` always shown).

**Best practice**

Default is internal-safe. Set `public` only for features safe for help docs.

:::

::: details decisions (optional, object[])

#### `decisions`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
decisions:
  - example-item
```

**Impact**

ADR-style decision records in feature docs.

**Best practice**

Record rejected alternatives — future agents will re-propose them otherwise.

:::

::: details flows (optional, object[])

#### `flows`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
flows:
  - example-item
```

**Impact**

Drives Mermaid sequence diagrams and numbered steps in feature docs.

**Best practice**

Prefer 3–7 steps. Use stable `id`s so diagrams and contracts can reference them.

:::

::: details interfaces (optional, object[])

#### `interfaces`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
interfaces:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details contracts (optional, object[])

#### `contracts`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
contracts:
  - example-item
```

**Impact**

Acceptance criteria in feature docs; feed test-planning via `usm_get_contracts`.

**Best practice**

Write `must_have` as checkable assertions, not vague wishes.

:::

::: details tests (optional, object[])

#### `tests`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
tests:
  - example-item
```

**Impact**

Given/When/Then blocks; auto-generate Vitest specs when present.

**Best practice**

One test per contract when possible. Keep setup keys machine-readable.

:::

::: details implementation (optional, object)

#### `implementation`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
implementation:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details see_also (optional, string[])

#### `see_also`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
see_also:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details routes (optional, object[])

#### `routes`

**Description and intent**

Routes (pages + API endpoints) that compose this feature

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
routes:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details apps (optional, string[])

#### `apps`

**Description and intent**

Apps this feature is deployed in

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
apps:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details source (optional, string)

#### `source`

**Description and intent**

How this feature was detected (e.g., 'scan', 'hand-written')

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
source: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details usage (optional, object[])

#### `usage`

**Description and intent**

Command usage examples for this feature

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
usage:
  - example-item
```

**Impact**

Powers CLI reference pages (`usm generate --only docs`).

:::

::: details options (optional, object[])

#### `options`

**Description and intent**

CLI options/flags for this feature

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
options:
  - example-item
```

**Impact**

Powers CLI option tables in the CLI reference.

:::

::: details prerequisites (optional, string[])

#### `prerequisites`

**Description and intent**

What needs to exist before using this feature

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
prerequisites:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details command (optional, string)

#### `command`

**Description and intent**

The user-facing name shown in reference docs, decoupled from the internal $id grouping. For CLI features this is the command as typed (e.g. 'init', 'scan', without the 'usm' prefix). For MCP features this is the tool name (e.g. 'usm_read', 'usm_report_feedback'). Optional — generators fall back to the $id's last segment when absent.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
command: "example-value"
```

**Impact**

Display name for CLI/MCP reference (preferred over `$id` slug).

**Best practice**

Bare name only (`init`, `usm_read`) — no `usm` prefix for CLI, full tool name for MCP.

:::

::: details reference (optional, [referenceBlock](#referenceblock)[])

#### `reference`

**Description and intent**

User-facing reference blocks — rendered after standard feature doc sections. Unlike contracts, reference blocks with audience: public survive the help-doc filter.

**Type and constraints**

- Type: [`referenceBlock`](#referenceblock)[]
- Required: no

**YAML example**

```yaml
reference:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

## feedback Files

A structured feedback entry (bug, improvement, or question) reported by an agent or human. Lives in .usm/feedback/. First-class .usm file — queryable via MCP, convertible to features or issues.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | `"https://usm.dev/schema/v1.json"` | yes |  |
| `$id` | string | yes | Unique identifier: system/name (e.g. usm/scan-drops-empty-dirs) |
| `$type` | `"feedback"` | yes |  |
| `$version` | integer | yes |  |
| `$last_updated` | string | — |  |
| `kind` | `bug` \| `improvement` \| `question` | yes | The nature of the feedback |
| `severity` | `low` \| `medium` \| `high` \| `critical` | yes |  |
| `title` | string | — | Short one-line title |
| `summary` | string | yes | Description of the issue or suggestion |
| `status` | `open` \| `acknowledged` \| `resolved` \| `wontfix` | yes |  |
| `reported_by` | string | yes | Who reported this — e.g. 'agent:glm-5.2' or 'human:james' |
| `feature` | string | — | Related feature $id (optional) |
| `reproduction` | string | — | Steps to reproduce (for bugs) |
| `suggested_fix` | string | — | Proposed resolution (optional) |
| `created` | string | — | Date created (ISO 8601 date) |

### Field details

::: details $schema (required, "https://usm.dev/schema/v1.json")

#### `$schema`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `"https://usm.dev/schema/v1.json"`
- Required: yes
- const: `"https://usm.dev/schema/v1.json"`

**YAML example**

```yaml
$schema: "https://usm.dev/schema/v1.json"
```

**Impact**

Pins the JSON Schema version used by `usm validate`.

:::

::: details $id (required, string)

#### `$id`

**Description and intent**

Unique identifier: system/name (e.g. usm/scan-drops-empty-dirs)

**Type and constraints**

- Type: string
- Required: yes
- pattern: `^[a-z0-9][a-z0-9-]*/[a-z0-9][a-z0-9-]*$`

**YAML example**

```yaml
$id: "example-value"
```

**Impact**

Stable identity used by MCP tools, cross-refs, and generators.

**Best practice**

Format `org/name`. Immutable after write — never rename casually.

:::

::: details $type (required, "feedback")

#### `$type`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `"feedback"`
- Required: yes
- const: `"feedback"`

**YAML example**

```yaml
$type: "feedback"
```

**Impact**

Discriminator for validation (`oneOf`) and type-specific generators.

:::

::: details $version (required, integer)

#### `$version`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: integer
- Required: yes
- minimum: 1

**YAML example**

```yaml
$version: 1
```

**Impact**

Schema format version; mismatch produces a validation warning.

:::

::: details $last_updated (optional, string)

#### `$last_updated`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
$last_updated: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details kind (required, bug \/ improvement \/ question)

#### `kind`

**Description and intent**

The nature of the feedback

**Type and constraints**

- Type: `bug` \| `improvement` \| `question`
- Required: yes
- enum: `bug`, `improvement`, `question`

**YAML example**

```yaml
kind: "bug"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details severity (required, low \/ medium \/ high \/ critical)

#### `severity`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `low` \| `medium` \| `high` \| `critical`
- Required: yes
- enum: `low`, `medium`, `high`, `critical`

**YAML example**

```yaml
severity: "low"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details title (optional, string)

#### `title`

**Description and intent**

Short one-line title

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
title: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details summary (required, string)

#### `summary`

**Description and intent**

Description of the issue or suggestion

**Type and constraints**

- Type: string
- Required: yes
- minLength: 10

**YAML example**

```yaml
summary: |
  One or two sentences describing this.
```

**Impact**

Rendered on every generated doc page; used by MCP `usm_list` / `usm_search`.

**Best practice**

Keep to 1–3 sentences. Lead with the outcome, not the implementation.

:::

::: details status (required, open \/ acknowledged \/ resolved \/ wontfix)

#### `status`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: `open` \| `acknowledged` \| `resolved` \| `wontfix`
- Required: yes
- enum: `open`, `acknowledged`, `resolved`, `wontfix`
- default: `"open"`

**YAML example**

```yaml
status: "open"
```

**Impact**

Drives help-docs filtering (only `built`/`public` appear); badges in sidebar.

**Best practice**

Only advance planned → in-progress → built → deprecated. Use MCP status tools.

:::

::: details reported_by (required, string)

#### `reported_by`

**Description and intent**

Who reported this — e.g. 'agent:glm-5.2' or 'human:james'

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
reported_by: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details feature (optional, string)

#### `feature`

**Description and intent**

Related feature $id (optional)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
feature: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details reproduction (optional, string)

#### `reproduction`

**Description and intent**

Steps to reproduce (for bugs)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
reproduction: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details suggested_fix (optional, string)

#### `suggested_fix`

**Description and intent**

Proposed resolution (optional)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
suggested_fix: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details created (optional, string)

#### `created`

**Description and intent**

Date created (ISO 8601 date)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
created: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

## Shared building blocks

These shapes appear inside feature (and other) files — flows, contracts, tests, decisions, CLI usage.

### flows

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Kebab-case flow identifier |
| `name` | string | yes |  |
| `description` | string | — |  |
| `steps` | object[] | yes |  |

#### Field details

::: details id (required, string)

#### `id`

**Description and intent**

Kebab-case flow identifier

**Type and constraints**

- Type: string
- Required: yes
- pattern: `^[a-z][a-z0-9-]*$`

**YAML example**

```yaml
id: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details name (required, string)

#### `name`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
name: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details description (optional, string)

#### `description`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
description: |
  One or two sentences describing this.
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details steps (required, object[])

#### `steps`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: yes

**YAML example**

```yaml
steps:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

### contracts

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes |  |
| `description` | string | yes |  |
| `applies_after` | string[] | — |  |
| `must_have` | union[] | — |  |

#### Field details

::: details id (required, string)

#### `id`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes
- pattern: `^[a-z][a-z0-9-]*$`

**YAML example**

```yaml
id: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details description (required, string)

#### `description`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
description: |
  One or two sentences describing this.
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details applies_after (optional, string[])

#### `applies_after`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
applies_after:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details must_have (optional, union[])

#### `must_have`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: union[]
- Required: no

**YAML example**

```yaml
must_have:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

### tests

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes |  |
| `flow` | union | — |  |
| `setup` | object | — |  |
| `expect` | object[] | yes |  |
| `contracts` | string[] | — |  |

#### Field details

::: details id (required, string)

#### `id`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes
- pattern: `^[a-z][a-z0-9-]*$`

**YAML example**

```yaml
id: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details flow (optional, union)

#### `flow`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: union
- Required: no

**YAML example**

```yaml
flow: …
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details setup (optional, object)

#### `setup`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object
- Required: no

**YAML example**

```yaml
setup:
  # nested fields…
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details expect (required, object[])

#### `expect`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: object[]
- Required: yes

**YAML example**

```yaml
expect:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details contracts (optional, string[])

#### `contracts`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string[]
- Required: no

**YAML example**

```yaml
contracts:
  - example-item
```

**Impact**

Acceptance criteria in feature docs; feed test-planning via `usm_get_contracts`.

**Best practice**

Write `must_have` as checkable assertions, not vague wishes.

:::

### decisions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes |  |
| `decision` | string | yes |  |
| `rationale` | string | yes |  |
| `date` | string | — |  |
| `status` | `proposed` \| `accepted` \| `rejected` \| `superseded` | — | ADR status |
| `alternatives` | object[] | — | Alternatives considered and rejected (ADR-style) |
| `consequences` | string | — | What consequences this decision has (positive and negative) |

#### Field details

::: details id (required, string)

#### `id`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
id: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details decision (required, string)

#### `decision`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
decision: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details rationale (required, string)

#### `rationale`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
rationale: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details date (optional, string)

#### `date`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
date: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details status (optional, proposed \/ accepted \/ rejected \/ superseded)

#### `status`

**Description and intent**

ADR status

**Type and constraints**

- Type: `proposed` \| `accepted` \| `rejected` \| `superseded`
- Required: no
- enum: `proposed`, `accepted`, `rejected`, `superseded`
- default: `"accepted"`

**YAML example**

```yaml
status: "proposed"
```

**Impact**

Drives help-docs filtering (only `built`/`public` appear); badges in sidebar.

**Best practice**

Only advance planned → in-progress → built → deprecated. Use MCP status tools.

:::

::: details alternatives (optional, object[])

#### `alternatives`

**Description and intent**

Alternatives considered and rejected (ADR-style)

**Type and constraints**

- Type: object[]
- Required: no

**YAML example**

```yaml
alternatives:
  - example-item
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details consequences (optional, string)

#### `consequences`

**Description and intent**

What consequences this decision has (positive and negative)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
consequences: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

### usage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | yes | The command invocation |
| `description` | string | yes | What this invocation does |

#### Field details

::: details command (required, string)

#### `command`

**Description and intent**

The command invocation

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
command: "example-value"
```

**Impact**

Display name for CLI/MCP reference (preferred over `$id` slug).

**Best practice**

Bare name only (`init`, `usm_read`) — no `usm` prefix for CLI, full tool name for MCP.

:::

::: details description (required, string)

#### `description`

**Description and intent**

What this invocation does

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
description: |
  One or two sentences describing this.
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

### options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `flag` | string | yes | Flag name (e.g. '--root &lt;root&gt;') |
| `description` | string | yes |  |
| `default` | string | — |  |

#### Field details

::: details flag (required, string)

#### `flag`

**Description and intent**

Flag name (e.g. '--root &lt;root&gt;')

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
flag: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details description (required, string)

#### `description`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: yes

**YAML example**

```yaml
description: |
  One or two sentences describing this.
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details default (optional, string)

#### `default`

**Description and intent**

No description in schema.

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
default: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

## common Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | `"https://usm.dev/schema/v1.json"` | yes | Schema reference URI |
| `$id` | string | yes | Unique identifier: system/name (e.g. smith-gray/system) |
| `$type` | `system` \| `service` \| `feature` \| `api` \| `data` \| `policy` \| `operations` \| `feedback` | yes | File type discriminator |
| `$version` | integer | yes | Schema version (starts at 1) |
| `$last_updated` | string | — | Last update date (ISO 8601 date) |
| `summary` | string | yes | 1-3 sentence summary for quick agent scan |

### Field details

::: details $schema (required, "https://usm.dev/schema/v1.json")

#### `$schema`

**Description and intent**

Schema reference URI

**Type and constraints**

- Type: `"https://usm.dev/schema/v1.json"`
- Required: yes
- const: `"https://usm.dev/schema/v1.json"`

**YAML example**

```yaml
$schema: "https://usm.dev/schema/v1.json"
```

**Impact**

Pins the JSON Schema version used by `usm validate`.

:::

::: details $id (required, string)

#### `$id`

**Description and intent**

Unique identifier: system/name (e.g. smith-gray/system)

**Type and constraints**

- Type: string
- Required: yes
- pattern: `^[a-z0-9][a-z0-9-]*/[a-z0-9][a-z0-9-]*$`

**YAML example**

```yaml
$id: "example-value"
```

**Impact**

Stable identity used by MCP tools, cross-refs, and generators.

**Best practice**

Format `org/name`. Immutable after write — never rename casually.

:::

::: details $type (required, system \/ service \/ feature \/ api \/ data \/ policy \/ ope)

#### `$type`

**Description and intent**

File type discriminator

**Type and constraints**

- Type: `system` \| `service` \| `feature` \| `api` \| `data` \| `policy` \| `operations` \| `feedback`
- Required: yes
- enum: `system`, `service`, `feature`, `api`, `data`, `policy`, `operations`, `feedback`

**YAML example**

```yaml
$type: "system"
```

**Impact**

Discriminator for validation (`oneOf`) and type-specific generators.

:::

::: details $version (required, integer)

#### `$version`

**Description and intent**

Schema version (starts at 1)

**Type and constraints**

- Type: integer
- Required: yes
- minimum: 1

**YAML example**

```yaml
$version: 1
```

**Impact**

Schema format version; mismatch produces a validation warning.

:::

::: details $last_updated (optional, string)

#### `$last_updated`

**Description and intent**

Last update date (ISO 8601 date)

**Type and constraints**

- Type: string
- Required: no

**YAML example**

```yaml
$last_updated: "example-value"
```

**Impact**

Validated by `usm validate`; available to generators and MCP tools.

:::

::: details summary (required, string)

#### `summary`

**Description and intent**

1-3 sentence summary for quick agent scan

**Type and constraints**

- Type: string
- Required: yes
- minLength: 10

**YAML example**

```yaml
summary: |
  One or two sentences describing this.
```

**Impact**

Rendered on every generated doc page; used by MCP `usm_list` / `usm_search`.

**Best practice**

Keep to 1–3 sentences. Lead with the outcome, not the implementation.

:::

## See also

- [CLI Reference](/cli-reference) — commands that create and validate these files
- [MCP Tools](/mcp-reference) — agent tools for reading/writing `.usm`
- [Getting Started](/getting-started) — first-run workflow
- [Agent Setup Guide](/agent-setup-guide) — wire USM into Cursor / Claude / Copilot
