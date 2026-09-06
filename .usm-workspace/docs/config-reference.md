# Configuration Reference

Fields in `usmconfig.json` — the configuration file that drives `usm init` and `usm scan`.

## Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `$schema` *(required)* | string | Schema reference URI |
| `version` *(required)* | string | Config schema version |
| `name` *(required)* | string | Project name (used in generated $id namespaces) |
| `sources` | $ref → #/$defs/sources | Where to scan for code and manifests |
| `shared` | array | Packages that aren't services (shared libraries, utilities, etc.) |
| `services` | array | Explicit service detection rules |
| `apis` | array | API detection rules |
| `data` | array | Data model detection rules |
| `features` | $ref → #/$defs/featureConfig | Feature detection configuration |
| `outputs` | $ref → #/$defs/outputs | Where to write generated artifacts |
| `generation` | $ref → #/$defs/generation | Generation behavior settings |
| `llm` | $ref → #/$defs/llmConfig | LLM configuration for future semantic scan (optional) |
| `enrichment` | $ref → #/$defs/enrichmentConfig | LLM-based semantic enrichment configuration (optional) |

## sources

| Field | Type | Description |
|-------|------|-------------|
| `root` | string | Repository root directory (relative to config file location) |
| `include` | $ref | Glob patterns for directories to include in scanning |
| `exclude` | $ref | Glob patterns for directories to exclude from scanning |
| `package_manifests` | $ref | Glob patterns for package manifest files |
| `code_globs` | $ref | Glob patterns for source code files |

## sharedPackage

| Field | Type | Description |
|-------|------|-------------|
| `id` *(required)* | string | Unique identifier for this shared package |
| `match` *(required)* | string | Glob pattern to match this package's directory |
| `kind` *(required)* | string | Classification of the shared package |
| `summary` | string | Human-readable summary of this package's purpose |

## serviceRule

| Field | Type | Description |
|-------|------|-------------|
| `match` *(required)* | string | Glob pattern to match service directories |
| `kind` *(required)* | string | Service type classification |
| `port_from` | string | Hint for port extraction (e.g. 'package.json:scripts.start', '.env:PORT') |
| `framework_detect` | array | Glob patterns for files that indicate this framework |
| `summary` | string | Human-readable summary of what this service does |

## extractConfig

| Field | Type | Description |
|-------|------|-------------|
| `routes` | boolean | Extract route definitions |
| `request_types` | boolean | Extract request type schemas |
| `response_types` | boolean | Extract response type schemas |
| `auth_required` | boolean | Extract auth requirements per endpoint |

## apiRule

| Field | Type | Description |
|-------|------|-------------|
| `match` *(required)* | string | Glob pattern to match API directories or files |
| `kind` *(required)* | string | API type classification |
| `extract` | $ref | What to extract from the API definitions |

## dataExtractConfig

| Field | Type | Description |
|-------|------|-------------|
| `models` | boolean | Extract model/entity names |
| `relations` | boolean | Extract model relations |
| `enums` | boolean | Extract enum definitions |

## dataRule

| Field | Type | Description |
|-------|------|-------------|
| `match` *(required)* | string | Glob pattern to match schema files |
| `kind` *(required)* | string | ORM/database type |
| `extract` | $ref | What to extract from the schema |

## featureConfig

| Field | Type | Description |
|-------|------|-------------|
| `detect_from` | array | Glob patterns for files that contain feature definitions |
| `group_by` | string | How to group detected features |
| `exclude_patterns` | array | Glob patterns for files/directories to exclude from feature detection |

## outputs

| Field | Type | Description |
|-------|------|-------------|
| `workspace` | string | Root directory for all generated output |
| `docs` | string | Directory for generated developer docs (markdown) |
| `help_docs` | string | Directory for generated help docs (filtered, public-facing) |
| `archimate` | string | Directory for generated ArchiMate XML |
| `togaf` | string | Directory for generated TOGAF deliverables |
| `openapi` | string | Directory for generated OpenAPI spec and types |
| `tests` | string | Directory for generated test specs |
| `usm_source` | string | Directory for .usm source files |
| `agents_md` | string | Path for generated AGENTS.md file |

## generation

| Field | Type | Description |
|-------|------|-------------|
| `merge_with_existing` | string | How to handle existing files: smart (preserve decisions), overwrite, skip, or fail |
| `preserve_comments` | boolean | Preserve YAML comments in existing files when merging |
| `format` | string | Markdown format for generated documentation |

## llmConfig

| Field | Type | Description |
|-------|------|-------------|
| `provider` | string | LLM provider for semantic scanning |
| `model` | string | Model identifier (e.g. 'claude-sonnet-4-20250514') |
| `api_key_env` | string | Environment variable name holding the API key |

## enrichmentConfig

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Whether enrichment is enabled |
| `provider` | string | LLM provider for semantic enrichment |
| `url` | string | Base URL for the LLM API endpoint |
| `apiKey` | string | API key for the LLM provider (optional for local providers like Ollama) |
| `model` | string | Model identifier for the LLM |
| `temperature` | number | Temperature for LLM generation |
| `max_tokens_per_file` | integer | Maximum tokens per file enrichment call |
| `fields` | array | Which fields to enrich (only fields with TODO: describe will be filled) |
| `preserve_human_edits` | boolean | Whether to preserve hand-written content during merge |
| `max_source_file_chars` | integer | Maximum characters to read from each source file (keeps context manageable) |
