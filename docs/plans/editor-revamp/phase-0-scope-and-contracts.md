# Phase 0: Scope And Contracts

## Short Summary For Maintainer

Define the data contract before implementation. This phase locks down the metadata schema, clip identity keys, and IPC payload changes so later phases can implement quickly without rework.

## Detailed Agent Instructions

### Objective

Create a stable metadata contract that can represent source identity, range, trim mode, and audio-track selection for every exported clip.

Validation in this phase is Zod-first: runtime schema definitions and TypeScript types must stay aligned.

### Steps

1. Define metadata schema types in shared contracts.
2. Define canonical identity functions in domain logic.
3. Update export-plan job shape to carry metadata payload.
4. Add unit tests for identity generation and schema validation behavior.
5. Document invariants and compatibility rules in code comments and this phase file if adjustments are needed.
6. Add Zod schemas for incoming IPC payloads and outgoing metadata payloads.
7. Use schema-derived typing where practical to reduce duplicated interface maintenance.

### Validation Technology Standard

1. Use Zod for runtime validation at IPC boundaries and metadata construction points.
2. Keep JSON Schema out of scope for this plan.
3. Prefer strict object schemas and explicit parse failures over permissive coercion.

### Suggested Files And Split

Create or update the following files in this phase:

- `src/shared/contracts.ts`
	- Add additive contract types for export metadata envelopes and enriched clip snapshots.
- `src/shared/exportMetadata.ts`
	- Add Zod schemas and derived types for metadata payloads and snapshot payloads.
- `src/domain/exportMetadata.identity.ts`
	- Add pure helpers for sourceFingerprint, rangeKey, and variantKey generation.
- `src/domain/exportMetadata.normalize.ts`
	- Add pure helpers to normalize millisecond range values and track arrays.
- `src/domain/exportMetadata.identity.spec.ts`
	- Add deterministic identity tests.
- `src/shared/exportMetadata.spec.ts`
	- Add Zod schema validation tests.

Split rule for this phase:

1. Keep schema definitions separate from identity and normalization helpers.
2. Keep tests split by concern so each file remains focused and under line limits.

### Required Data Fields

- schemaVersion
- appName
- clipId
- planId
- sourceFingerprint
- rangeMs: startMs, endMs, durationMs
- trimMode
- selectedAudioTrackIndices
- mutedAudioTrackIndices
- variantKey
- createdAtMs

### Identity Rules

1. sourceFingerprint must be deterministic for the same source input.
2. range identity must use millisecond values, never floored whole seconds.
3. variantKey must include trimMode and audio-track selection state.
4. clipId must be unique per export artifact.
5. planId must be stable for a single submitted export run.

### Touchpoints

- shared contracts for IPC payload and clip snapshots
- domain modules for key-building and normalization
- export-plan creation path in main process
- shared Zod schema modules consumed by handlers and domain builders

### Testing Requirements

1. Same input produces same sourceFingerprint and variantKey.
2. Different track selections produce different variantKey.
3. Millisecond-different ranges are not collapsed into one key.
4. Invalid metadata payloads are rejected safely.
5. Zod schema failures return deterministic and actionable error messages.

### Exit Criteria

- Contract types compile and are used by plan creation.
- Zod runtime schemas are implemented and wired into contract entrypoints.
- Tests cover success and invalid-input paths.
- No renderer behavior change yet.

## Implementation Status (2026-07-20)

Overall: DONE

Completed:

1. Shared metadata contract and Zod schemas are in place.
2. Canonical identity helpers exist for source fingerprint, range key, and variant key.
3. Export job shape carries metadata payloads through plan creation.
4. Identity and schema tests exist and cover core deterministic behavior.

Notes:

- This phase's foundation is implemented and actively used by later phases.
- No blocking deltas identified for Phase 0.

### Phase Handoff Artifacts

Provide these handoff notes in the implementing PR description:

1. Final field list and schema version.
2. Identity algorithm summary for sourceFingerprint, rangeKey, and variantKey.
3. Known compatibility assumptions retained for later phases.
