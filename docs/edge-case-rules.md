# Edge-Case Review Rules

Run through this checklist before marking any step, feature, or PR complete —
especially anything touching money, inventory, shared/mutable state, or
concurrent access. These aren't abstract best practices; each rule exists
because skipping it produced a real, shipped bug at some point.

## 1. Enumerate every state, not just the ones you're building for

Before writing logic against an entity (a DB row, an API response, a form
input), list every state it can actually be in — not just the two or three
your happy path assumes. Common undercounted states: soft-deleted vs
hard-deleted, null/missing relations, zero vs negative vs missing values,
partially-migrated records, and anything a status/enum column allows that the
UI doesn't currently expose.

**Rule:** Before writing branch logic, write the full state enumeration as a
comment first. If a state exists in the schema or type definition but isn't
handled, that's a bug — not a future improvement.

**Rule:** Before claiming a fallback path is correct ("archived records will
still have their metadata"), verify the mechanism it depends on actually
exists in the current schema/API version. Don't describe planned or assumed
behavior as current behavior.

**Rule:** Distinguish states that are _reachable under current constraints_
from ones that are defensive-only (e.g., blocked by a NOT NULL foreign key).
Both are worth guarding against, but say so explicitly — a future reader
shouldn't go looking for how to reproduce an unreachable case against real
data.

## 2. Never let a mutation, removal, or override happen silently

If code drops an item, zeroes a value, caps an input, or overrides what a
user supplied, the system must record _why_ — not just produce the corrected
end state. A silently-clamped quantity or a silently-dropped record leaves
downstream code (and the user) unable to explain what happened.

**Rule:** Any code path that removes, clamps, or overrides user-supplied
input must attach a machine-readable reason, not just the adjusted value. If
there isn't a one-line justification for why the change is invisible to the
user, it shouldn't be invisible.

**Rule:** Watch for _premature_ clamping — capping a value before it reaches
the function responsible for reporting _why_ it was capped. This hides the
adjustment from the layer meant to surface it, even though the final number
is technically correct.

**Rule:** Give different causes of the same outward effect (e.g., "quantity
reduced") distinct, specific reasons instead of one generic label. A limit
hit because of low stock and a limit hit because of a policy cap look
identical to the user but mean different things and may need different UI
treatment.

## 3. One source of truth for any value or decision computed more than once

If two code paths both need to know the same fact (is this valid, what's the
current total, is this feature enabled), one must call the other — never let
both independently re-derive it from possibly-different or possibly-stale
inputs. The classic failure mode: function A computes a value, adjusts some
shared state based on it, and then function B re-evaluates that same
condition using the _already-adjusted_ state, arriving at a different
answer than A did.

**Rule:** If a threshold, limit, or config value is used in more than one
place (business logic, UI copy, validation), it must be imported from one
canonical definition — never restated as a literal in a second location,
including inside user-facing strings.

**Rule:** After consolidating duplicated logic, grep for remaining direct
calls to the old, now-redundant functions. Mark deprecated functions loudly
(a `@deprecated` annotation naming the specific bug they can reintroduce)
rather than leaving them present "for compatibility" with no warning.

**Rule:** Watch for edge inputs that skip the normal computation path
entirely (an empty list, a zero value, a null case) — these often bypass the
shared logic via an early return, silently losing information (like a
specific failure reason) that the full path would have produced.

## 4. Test the adversarial case, not just the one you already handled

A green test suite only proves what the tests check. Before trusting it:

- For any clamp/cap/limit logic: test the combined or aggregate case, not
  just a single input. Two individually-valid values can combine into an
  invalid one.
- For any threshold or validation logic: test it against a value that's
  already been adjusted by another rule in the same pass, not just in
  isolation. Interacting rules are where inconsistency hides.
- For any "reject/omit invalid input" logic: assert _why_ it was
  rejected/omitted, not just that the output shrank or changed.
  `expect(result).toHaveLength(0)` proves nothing about whether the reason is
  tracked or correct.
- For any state shared across sessions, tabs, or requests: write a test with
  duplicate or conflicting entries for the same key, not just clean,
  single-writer input.
- Name tests precisely for what they actually prove. A test called "handles
  concurrent access" that only tests merging of already-duplicated data
  (rather than two writes racing in real time) is testing a narrower
  guarantee than its name implies — mislabeling it hides the gap instead of
  documenting it.

## 5. Distinguish "matches the spec/plan" from "matches reality"

Specs, doc comments, and remediation plans can be aspirational without
anyone noticing, because they read as authoritative. When a written
explanation says a system "handles X" — verify the handling exists in the
actual code, not just in the writeup. Treat every claim in a completion
summary or design doc as something to spot-check against the diff, not as a
settled fact.

**Rule:** If a fix depends on a schema change, config value, or upstream
capability that hasn't shipped yet, say so explicitly rather than describing
the fix as already in effect.

## 6. Concurrency: assume two things happen at the same time

Any read-then-write against shared state (a counter, a session, a cached
value, a file) should be checked against: what happens if two requests hit
this a millisecond apart? Read-time validation or display logic is
advisory, not a lock — the actual authoritative mutation needs an atomic,
transactional guarantee at the point the real state changes, not just at the
point data is shown to a user.

**Rule:** Deduplicating or merging conflicting state _after the fact_ (e.g.,
cleaning up a corrupted record) is a different and weaker guarantee than
preventing the conflict during the write itself (e.g., last-write-wins
silently dropping one of two concurrent writes). Know which one your fix
actually provides, and don't let a test for the former stand in for the
latter.

## 7. Respect architectural boundaries you've already documented elsewhere

If an earlier design decision established a hard rule (writes only happen in
a specific layer, a client payload must stay under a size limit, a function
must be pure), a later change that reintroduces the violated pattern is a
regression, not a new decision. This is the single easiest way for a fixed
bug to come back — a subsequent fix, written without re-reading the
original constraint, quietly recreates it.

**Rule:** Before adding a write, side effect, or new call path to existing
code, check whether it's being invoked from a context where that's actually
legal (a request handler vs. a render path; a background job vs. a
user-facing action) — don't assume a function's current call sites define
all its future ones.

## 8. Never hand-roll signed framework cookies in test fixtures

Frameworks like Better Auth sign session cookies with HMACs (`BETTER_AUTH_SECRET`). Setting raw UUID strings into cookies bypasses cryptographic signing, causing read-time verification (`getSession()`) to reject the session.

**Rule:** Always generate test cookies via Better Auth's native `testUtils` plugin (`test.login()`). Never write raw session strings into test cookies.

## 9. Before marking anything done, ask out loud:

- What's the full set of states this code can encounter, and does every one
  have a defined, intentional behavior?
- If this drops, clamps, or silently changes something, would the end user
  (or the calling code) be able to tell what happened and why?
- Is there more than one place computing the same fact or limit? If so,
  which one is the source of truth, and do the others delegate to it?
- Did I write a test that tries to break this, or only tests that confirm it
  works the way I already built it?
- Does this doc or comment describe what the code does today, or what it
  will do once something else (a migration, a dependency, a later step)
  exists?
- Does this change respect every architectural constraint documented
  earlier in the project, or does it quietly reintroduce something already
  fixed once?
