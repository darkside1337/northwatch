// Test-environment stub for the `server-only` package.
// Vitest executes server modules directly in Node, where the real package
// throws ("cannot be imported from a Client Component module"). The stub
// preserves the import graph for tests; production builds still resolve the
// real package via node_modules.
export {};
