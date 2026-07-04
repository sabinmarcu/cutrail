# Phase 5: Platform Polish And Expansion

## Intent

Phase 5 is for deliberate expansion after the core workflow and Linux release path are stable. It should improve quality and reach without destabilizing the product’s narrow purpose.

## Primary Goals

- Reduce remaining UX friction in the clipping workflow.
- Evaluate cross-platform or performance-oriented enhancements from a stable baseline.
- Add polish only where it materially improves the clipping experience.

## Scope

### In scope

- Performance and hardware-acceleration exploration.
- Accessibility and keyboard-flow improvements.
- Optional Windows and macOS packaging evaluation.
- Auto-update investigation for non-AUR installs.

### Out of scope

- Reinventing the core architecture.
- Feature expansion into general video editing.

## Dependencies And Inputs

- Stable Phase 4 release process.
- Enough user or maintainer feedback to prioritize polish rationally.

## Workstreams

### 1. UX Polish

#### Outcomes

- The app feels faster, clearer, and less error-prone in repeated use.

#### Tasks

- Refine preview and queue feedback based on real usage friction.
- Improve recovery flows and empty/error states.
- Tighten keyboard navigation for frequent actions.

#### Deliverables

- Incremental but meaningful workflow improvements.

### 2. Accessibility And Interaction Quality

#### Outcomes

- The application is easier to operate across input styles and user needs.

#### Tasks

- Improve focus management and keyboard access.
- Review contrast, labeling, and assistive affordances.
- Reduce UI ambiguity in range editing and export control surfaces.

#### Deliverables

- Accessibility-focused UI improvements.

### 3. Performance And Hardware Options

#### Outcomes

- Performance work is guided by actual bottlenecks rather than guesses.

#### Tasks

- Measure export and UI bottlenecks.
- Evaluate hardware-acceleration presets where they help clipping workflows.
- Keep any accelerated paths optional and clearly bounded.

#### Deliverables

- Measured performance improvements and optional acceleration paths.

### 4. Platform Expansion

#### Outcomes

- Broader platform support is explored from a stable release foundation.

#### Tasks

- Evaluate Windows and macOS build viability.
- Compare packaging tradeoffs for those platforms.
- Investigate updater strategy for non-AUR installations if distribution breadth justifies it.

#### Deliverables

- Platform expansion plan or initial implementation slices.

## Recommended Execution Sequence

1. Use feedback and observed friction to choose polish targets.
2. Address accessibility and keyboard flow alongside UX fixes.
3. Investigate performance and acceleration with measurements first.
4. Expand platform support only after the release base remains stable.

## Validation Checklist

- Chosen UX issues are measurably improved.
- Accessibility and keyboard navigation regressions are checked during changes.
- Performance work is justified by observed bottlenecks.
- Any new platform packaging path is documented and reproducible.

## Risks And Mitigations

- Polish work can become open-ended.
  - Mitigation: prioritize from concrete user friction and release goals.
- Cross-platform support may reopen foundational assumptions.
  - Mitigation: treat new platforms as constrained projects, not automatic ports.
- Hardware acceleration may introduce inconsistent behavior.
  - Mitigation: keep acceleration optional and preserve a reliable software path.

## Exit Criteria

- The app is materially easier to use and maintain at release quality.
- Expansion work does not erode the clipping-first product focus.

## Agent Notes

- Use evidence, not novelty, to choose polish work.
- Reject platform or performance changes that destabilize the proven core workflow.