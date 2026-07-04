# Phase 3: Accuracy, Presets, And Export Controls

## Intent

Phase 3 expands export control after the fast path is already trustworthy. The point is to offer intentional tradeoffs, not to turn cutrail into a general-purpose transcoder.

## Primary Goals

- Add accurate trim mode with clear UX and technical boundaries.
- Introduce a small preset model for common export choices.
- Improve diagnostics so advanced export behavior remains understandable.

## Scope

### In scope

- Accurate trim support via re-encode paths.
- Structured export presets.
- Clearer export diagnostics and logging.

### Out of scope

- Broad codec lab features.
- Arbitrary encode graph construction.
- Effects, filters, or editing features unrelated to clipping.

## Dependencies And Inputs

- Phase 1 and Phase 2 workflows should already be stable.
- Export command boundaries must remain isolated inside infra/domain layers.

## Workstreams

### 1. Accurate Trim Mode

#### Outcomes

- Users can choose correctness over speed when stream-copy cuts are insufficient.

#### Tasks

- Define the accurate-trim command path and stream behavior.
- Choose sane default encode settings.
- Expose the tradeoff in the UI without ambiguity.
- Keep command generation deterministic and testable.

#### Deliverables

- Accurate export mode with coverage around expected command outputs.

### 2. Export Preset Model

#### Outcomes

- Common export decisions become named, repeatable options.

#### Tasks

- Define a minimal preset schema.
- Decide which options belong in presets versus direct controls.
- Add defaults that cover the common fast and accurate workflows.
- Ensure preset changes integrate cleanly with persistence.

#### Deliverables

- Preset definitions and UI hooks.

### 3. Diagnostics And Observability

#### Outcomes

- More complex export flows are still debuggable by maintainers and understandable to users.

#### Tasks

- Improve error summaries and retry hints.
- Add structured logs or diagnostic events useful in development.
- Make it easier to distinguish invalid input, process failure, and unsupported media behavior.

#### Deliverables

- Better operational visibility for export failures.

## Recommended Execution Sequence

1. Add accurate-trim command support and tests.
2. Expose accurate mode in the UI with explicit messaging.
3. Introduce the preset model once both export paths are understood.
4. Improve diagnostics to support the expanded behavior surface.

## Validation Checklist

- Accurate mode produces expected command output and completes on representative media.
- Users can tell when they are choosing speed versus accuracy.
- Presets restore and apply predictably.
- Error output remains normalized across export modes.

## Risks And Mitigations

- Export options may create scope creep into full transcoding.
  - Mitigation: constrain presets to clipping-relevant choices only.
- Accurate mode may degrade perceived product speed.
  - Mitigation: keep fast mode as the default and explain the tradeoff plainly.
- Diagnostics may remain too raw for UI use.
  - Mitigation: continue mapping process details into stable application-level categories.

## Exit Criteria

- Users can intentionally choose between fast and accurate exports.
- Export settings feel structured and repeatable rather than improvised.

## Agent Notes

- Reject feature ideas that primarily serve generalized video conversion instead of clipping.
- Keep the command builder modular so preset growth does not leak into the renderer.