# Northwatch Architecture Decision Records (ADRs)

This document records the architectural and design decisions made for Northwatch, including context, trade-offs, and lifecycle status.

---

## ADR 001: Embedded \`price_cents\` on \`product_variants\` Table

- **Status**: \`Accepted (Durable)\`
- **Date**: 2026-09-08
- **Deciders**: Northwatch Core Team

### Context
Earlier draft planning documents (\`TODO.md\`) suggested a standalone \`prices\` table, whereas \`docs/SCHEMA.md\` and \`0000_cooing_black_bolt.sql\` placed \`price_cents\` directly as an integer column on \`product_variants\`.

### Decision
Store product pricing directly as \`price_cents: integer("price_cents").notNull()\` on the \`product_variants\` table.

### Rationale
- **Zero Join Overhead**: In v1, Northwatch operates with a single primary currency (USD) and sells boutique minimalist watches with a modest SKU count. Every variant has exactly one base price.
- **Integer Precision**: Storing money as integer cents eliminates IEEE 754 floating-point rounding errors while keeping queries simple and fast.
- **Future Flexibility**: If multi-currency localization or historical pricing schedules become necessary in future phases, a separate \`prices\` matrix table can be introduced then without premature complexity today.

---

## ADR 002: v1 Integrated Catalog Search via Postgres \`ILIKE\`

- **Status**: \`Accepted (Temporary — Scheduled for Phase 2 Deprecation & Deletion)\`
- **Date**: 2026-09-08
- **Deciders**: Northwatch Core Team

### Context
\`docs/PRD.md\` specifies that full-text external search (Algolia) is a Phase 2 feature (\`features/search/\`). In v1, there is no standalone \`/search\` page; customer search occurs via the header search bar navigating to \`/products?q=...\`.

### Decision
Support free-text search in v1 directly inside \`features/catalog/queries.ts: getProducts({ query, ... })\` using PostgreSQL case-insensitive pattern matching (\`ILIKE\`) across watch \`title\`, \`reference_code\`, and \`description\`.

### Concrete Phase 2 Migration Trigger
When Phase 2 introduces Algolia inside \`features/search/\`:
1. The \`query\` argument **must be deleted** from \`getProducts()\` in \`features/catalog/queries.ts\`.
2. \`features/catalog\` will be restricted strictly to structural, faceted catalog browsing (\`dialColor\`, \`strapMaterial\`, \`caseDiameter\`, \`minPrice\`, \`maxPrice\`, \`sort\`).
3. Free-text search will be handled exclusively by \`features/search/queries.ts: searchProducts()\`.

---

## ADR 003: Next.js 16.3+ \`cacheComponents: true\` and \`'use cache'\` Adoption

- **Status**: \`Accepted (Durable)\`
- **Date**: 2026-09-08
- **Deciders**: Northwatch Core Team

### Context
Next.js 16 graduated the cache components architecture. In Next.js 15, caching was enabled via \`experimental.dynamicIO\` or \`experimental.useCache\`. In Next.js 16.3+, the directive is activated via \`cacheComponents: true\` in \`next.config.ts\`.

### Decision
Enable \`cacheComponents: true\` in \`next.config.ts\` and utilize the official \`'use cache'\`, \`cacheTag()\`, and \`cacheLife()\` APIs from \`next/cache\` for catalog query caching.

### Rationale
- **Edge Performance**: Serves read-heavy product pages with instant sub-20ms TTFB from edge cache.
- **Neon Compute Efficiency**: Prevents waking serverless Neon Postgres instances on purely static catalog reads.
- **Declarative Invalidation**: Allows precise cache tagging (e.g. \`catalog\`, \`product:[slug]\`) and programmatic cache revalidation.
