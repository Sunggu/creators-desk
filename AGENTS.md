# AGENTS.md

> Guidelines and architectural constraints for AI agents contributing to `creators-desk`.

---

## 1. Prime Directives (Non-Negotiable Constraints)

All modifications, implementations, and reviews MUST strictly satisfy these 7 core invariants:

### Rule 1: Strict File Size Limit (Prevent Bloat)
- Single source files MUST NOT exceed **200 lines**.
- If a file approaches or exceeds this limit, refactor immediately by extracting sub-components, custom hooks, utilities, or services before committing changes.

### Rule 2: Single-Responsibility DTOs (No Monolithic Types)
- DO NOT bundle multiple DTOs/Schemas into a monolithic file (e.g., `types.ts` or `all-dto.ts`).
- Each request, response, or entity DTO must reside in its own isolated file:
  - Good: `create-project.dto.ts`, `project-response.dto.ts`
  - Bad: `models.ts` containing 10+ interfaces.

### Rule 3: Clean Architecture Layer Boundaries
- Code must strictly follow unidirectional dependency flow:
  `Domain (Entities, Contracts)` ← `Application (Use Cases)` ← `Infrastructure / Adapters` ← `Presentation / UI`
- Outer layers may depend on inner layers; inner layers MUST NOT depend on outer layers.
- Infrastructure-specific libraries or SDKs must never leak into Domain entities.

### Rule 4: Decoupled Business Logic
- UI components and Route handlers MUST NOT contain pure business rules or complex domain calculations.
- Isolate business logic inside testable **Use Cases** or **Domain Services**.
- Components only manage presentation state and invoke application interfaces.

### Rule 5: Deterministic Unit Testing First
- Pure functions, use cases, and domain logic MUST achieve isolated unit test coverage.
- Tests must be colocated or mirrored: `[name].spec.ts` or `[name].test.ts`.
- Every bug fix or new feature must accompany a verifiable unit test demonstrating success criteria.

### Rule 6: Lego-Block Component Composition
- Build UI elements as atomic, reusable, and single-purpose components.
- Favor composition (`children`, render props, slots) over prop drilling or bloated configuration objects.
- Each component should look and act like an isolated Lego block.

### Rule 7: File-System / Explicit Route Segmentation
- Routing must map cleanly to discrete page directories (e.g., `routes/` or `pages/`).
- Page files handle layout and route binding only; operational interfaces and domain assembly are delegated to underlying features.

---

## 2. Documentation Map of Content (MOC)

When working on specific domains, agents must cross-reference and update the corresponding index documents before and after modifying code:

| Index Doc (MOC) | Scope & Coverage | Target Directory |
|---|---|---|
| `docs/moc/architecture.md` | Layer rules, dependency graph, interface contracts | `src/core/`, `src/modules/` |
| `docs/moc/domain-lore.md` | Lore engine specs, entity relations, data schemas | `src/modules/lore/` |
| `docs/moc/domain-pipeline.md` | Multi-project tracking, status machines, workflows | `src/modules/pipeline/` |
| `docs/moc/ui-components.md` | Component catalog, design tokens, Lego assembly rules | `src/components/`, `src/ui/` |
| `docs/moc/testing.md` | Mocking patterns, test setups, coverage standards | `tests/` |

---

## 3. Pre-Commit Agent Verification Checklist

Before reporting task completion, verify:

- [ ] File lines checked: No file exceeds 200 lines.
- [ ] DTO structure: No shared monolithic type files created.
- [ ] Layer verification: No reverse dependencies into inner layers.
- [ ] Logic separation: Business calculations extracted from UI/Routes.
- [ ] Tests added: Unit tests exist and pass (`npm run test`).
- [ ] Component purity: Composable and isolated.
- [ ] MOC updated: Synced state in the relevant `docs/moc/*.md` document.