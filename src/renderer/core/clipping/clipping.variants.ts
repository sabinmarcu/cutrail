import type {
  ClipEntry,
  ClipRange,
  ClipVariantEntry,
  DraftClipVariant,
  ExistingClip,
  ProgressById,
} from './clipping.types';
import {
  createRangeKey,
  normalizeRangeMilliseconds,
} from '../../../domain/exportMetadata.normalize';

const buildRangeLookupKey = (range: { start: number; end: number }): string => createRangeKey(
  normalizeRangeMilliseconds(range),
);

export const normalizeVariantTrackIndices = (trackIndices: number[] | undefined): number[] => {
  if (!Array.isArray(trackIndices)) {
    return [];
  }

  const validIndices = trackIndices
    .filter((value) => Number.isInteger(value) && value >= 0)
    .map(Number);

  return [...new Set(validIndices)].sort((left, right) => left - right);
};

export const buildVariantKey = ({
  trimMode,
  selectedAudioTrackIndices,
  mutedAudioTrackIndices,
}: {
  trimMode: 'fast' | 'accurate';
  selectedAudioTrackIndices: number[];
  mutedAudioTrackIndices: number[];
}): string => (
  `trim=${trimMode}|selected=${selectedAudioTrackIndices.join(',')}|muted=${mutedAudioTrackIndices.join(',')}`
);

export const toVariantKeyFromClip = (clip: ExistingClip): string => {
  if (typeof clip.identityKeys?.variantKey === 'string' && clip.identityKeys.variantKey.length > 0) {
    return clip.identityKeys.variantKey;
  }

  return buildVariantKey({
    trimMode: clip.trimMode,
    selectedAudioTrackIndices: normalizeVariantTrackIndices(clip.selectedAudioTrackIndices),
    mutedAudioTrackIndices: normalizeVariantTrackIndices(clip.mutedAudioTrackIndices),
  });
};

const toVariantStatus = ({
  clip,
  hasPlannedOutput,
  progressRatio,
  rangeStatus,
}: {
  clip: ExistingClip | null;
  hasPlannedOutput: boolean;
  progressRatio: number | null;
  rangeStatus: string;
}): ClipVariantEntry['status'] => {
  if (clip) {
    const classification = clip.classificationKind;

    if (classification === 'legacy') {
      return 'legacy';
    }

    if (classification === 'foreign') {
      return 'foreign';
    }

    if (classification === 'invalid') {
      return 'invalid';
    }

    return 'exported';
  }

  if (progressRatio !== null) {
    return 'exporting';
  }

  if (rangeStatus === 'FAILED') {
    return 'failed';
  }

  if (hasPlannedOutput || rangeStatus === 'PLANNED' || rangeStatus === 'COMPLETED') {
    return 'planned';
  }

  return 'draft';
};

const toVariantState = ({
  status,
}: {
  status: ClipVariantEntry['status'];
}): ClipVariantEntry['state'] => {
  if (status === 'exporting') {
    return 'exporting';
  }

  if (status === 'exported' || status === 'legacy' || status === 'foreign' || status === 'invalid') {
    return 'exported';
  }

  return 'draft';
};

const withDerivedVariantLifecycle = (
  variantEntry: Omit<ClipVariantEntry, 'state' | 'isEditable'>,
): ClipVariantEntry => {
  const state = toVariantState({ status: variantEntry.status });

  if (state === 'draft') {
    return {
      ...variantEntry,
      state,
      isEditable: true,
    };
  }

  if (state === 'exporting') {
    return {
      ...variantEntry,
      state,
      isEditable: false,
    };
  }

  return {
    ...variantEntry,
    state,
    isEditable: false,
  };
};

const buildFallbackActiveVariant = (
  range: ClipRange,
  defaultTrimMode: 'fast' | 'accurate',
): ClipVariantEntry => ({
  clip: null,
  filePath: null,
  isLocked: false,
  key: `${range.id}::fallback`,
  modifiedAtMs: null,
  mutedAudioTrackIndices: [],
  progressText: 'pending',
  selectedAudioTrackIndices: [],
  state: 'draft',
  isEditable: true,
  status: 'draft',
  trimMode: defaultTrimMode,
});

export const deriveClipEntries = ({
  clipStatusMap,
  draftClipVariants,
  existingClips,
  planJobs,
  progressById,
  ranges,
  selectedVariantId,
  defaultTrimMode,
}: {
  clipStatusMap: Record<string, string>;
  draftClipVariants: DraftClipVariant[];
  existingClips: ExistingClip[];
  planJobs: Map<string, { outputPath?: string }>;
  progressById: ProgressById;
  ranges: ClipRange[];
  selectedVariantId: string | null;
  defaultTrimMode: 'fast' | 'accurate';
}): ClipEntry[] => [...ranges]
  .sort((left, right) => (
    left.start - right.start
    || left.end - right.end
    || left.id.localeCompare(right.id)
  ))
  .map((range) => {
    const rangeDraftVariants = draftClipVariants.filter((variant) => variant.rangeId === range.id);
    const plannedOutputPaths = new Set(
      rangeDraftVariants
        .map((variant) => planJobs.get(variant.id)?.outputPath)
        .filter((outputPath): outputPath is string => typeof outputPath === 'string'),
    );
    const trustedExistingClips = existingClips.filter((clip) => {
      const classification = clip.classificationKind;
      const isTrusted = classification !== 'foreign' && classification !== 'invalid';

      if (!isTrusted || buildRangeLookupKey(clip.range) !== buildRangeLookupKey(range)) {
        return false;
      }

      if (classification === 'legacy' && plannedOutputPaths.has(clip.filePath)) {
        return false;
      }

      return true;
    });
    const existingVariantEntriesByMergeKey = new Map<string, ClipVariantEntry[]>();

    for (const clip of trustedExistingClips) {
      const key = toVariantKeyFromClip(clip);
      const nextEntry = withDerivedVariantLifecycle({
        clip,
        filePath: clip.filePath,
        isLocked: true,
        key,
        modifiedAtMs: typeof clip.modifiedAtMs === 'number' ? clip.modifiedAtMs : null,
        mutedAudioTrackIndices: normalizeVariantTrackIndices(clip.mutedAudioTrackIndices),
        progressText: '100%',
        selectedAudioTrackIndices: normalizeVariantTrackIndices(clip.selectedAudioTrackIndices),
        status: toVariantStatus({
          clip,
          hasPlannedOutput: false,
          progressRatio: null,
          rangeStatus: 'COMPLETED',
        }),
        trimMode: clip.trimMode,
      });

      const previousEntries = existingVariantEntriesByMergeKey.get(key) ?? [];

      existingVariantEntriesByMergeKey.set(key, [...previousEntries, nextEntry]);
    }

    const takeExistingVariantEntry = ({
      mergeKey,
      plannedOutputPath,
    }: {
      mergeKey: string;
      plannedOutputPath: string | undefined;
    }): ClipVariantEntry | null => {
      const matchingExistingEntries = existingVariantEntriesByMergeKey.get(mergeKey) ?? [];

      if (matchingExistingEntries.length === 0) {
        return null;
      }

      if (typeof plannedOutputPath === 'string' && plannedOutputPath.length > 0) {
        const outputMatchIndex = matchingExistingEntries.findIndex(
          (entry) => entry.filePath === plannedOutputPath,
        );

        if (outputMatchIndex !== -1) {
          const [matchedEntry] = matchingExistingEntries.splice(outputMatchIndex, 1);

          if (matchingExistingEntries.length === 0) {
            existingVariantEntriesByMergeKey.delete(mergeKey);
          } else {
            existingVariantEntriesByMergeKey.set(mergeKey, matchingExistingEntries);
          }

          return matchedEntry;
        }

        return null;
      }

      const matchedEntry = matchingExistingEntries.shift() ?? null;

      if (matchingExistingEntries.length === 0) {
        existingVariantEntriesByMergeKey.delete(mergeKey);
      } else {
        existingVariantEntriesByMergeKey.set(mergeKey, matchingExistingEntries);
      }

      return matchedEntry;
    };

    const variantEntries: ClipVariantEntry[] = [];

    for (const draftVariant of rangeDraftVariants) {
      const plannedOutputPath = planJobs.get(draftVariant.id)?.outputPath;
      const mergeKey = buildVariantKey({
        trimMode: draftVariant.trimMode,
        selectedAudioTrackIndices: normalizeVariantTrackIndices(
          draftVariant.selectedAudioTrackIndices,
        ),
        mutedAudioTrackIndices: normalizeVariantTrackIndices(draftVariant.mutedAudioTrackIndices),
      });
      let existingVariantEntry = takeExistingVariantEntry({
        mergeKey,
        plannedOutputPath,
      });

      if (!existingVariantEntry && draftVariant.sourceFilePath === null) {
        const remainingExistingEntries = [...existingVariantEntriesByMergeKey.entries()]
          .flatMap(([existingKey, entries]) => entries.map((entry) => ({
            existingKey,
            entry,
          })));

        // If there is exactly one draft variant and one existing clip for this range,
        // pair them even when variant metadata is missing (legacy fallback path).
        if (rangeDraftVariants.length === 1 && remainingExistingEntries.length === 1) {
          const [fallbackCandidate] = remainingExistingEntries;
          const fallbackEntries = existingVariantEntriesByMergeKey.get(fallbackCandidate.existingKey) ?? [];
          const fallbackIndex = fallbackEntries.indexOf(fallbackCandidate.entry);

          if (fallbackIndex !== -1) {
            const [matchedFallback] = fallbackEntries.splice(fallbackIndex, 1);

            if (fallbackEntries.length === 0) {
              existingVariantEntriesByMergeKey.delete(fallbackCandidate.existingKey);
            } else {
              existingVariantEntriesByMergeKey.set(fallbackCandidate.existingKey, fallbackEntries);
            }

            existingVariantEntry = matchedFallback;
          }
        }
      }

      const rangeStatus = clipStatusMap[draftVariant.id] ?? 'DRAFT';
      const progressRatio = progressById[draftVariant.id]?.ratio ?? null;
      const hasPlannedOutput = typeof plannedOutputPath === 'string';
      const mergedStatus = existingVariantEntry?.clip
        ? toVariantStatus({
          clip: existingVariantEntry.clip,
          hasPlannedOutput: false,
          progressRatio: null,
          rangeStatus: 'COMPLETED',
        })
        : toVariantStatus({
          clip: null,
          hasPlannedOutput,
          progressRatio,
          rangeStatus,
        });

      variantEntries.push(withDerivedVariantLifecycle({
        clip: existingVariantEntry?.clip ?? null,
        filePath: existingVariantEntry?.filePath ?? null,
        isLocked: existingVariantEntry !== null,
        key: draftVariant.id,
        modifiedAtMs: existingVariantEntry?.modifiedAtMs ?? null,
        mutedAudioTrackIndices: normalizeVariantTrackIndices(
          draftVariant.mutedAudioTrackIndices,
        ),
        progressText: progressRatio === null ? 'pending' : `${Math.round(progressRatio * 100)}%`,
        selectedAudioTrackIndices: normalizeVariantTrackIndices(
          draftVariant.selectedAudioTrackIndices,
        ),
        status: mergedStatus,
        trimMode: draftVariant.trimMode,
      }));
    }

    for (const unmatchedExistingEntries of existingVariantEntriesByMergeKey.values()) {
      variantEntries.push(...unmatchedExistingEntries);
    }

    const sortedVariantEntries = variantEntries.sort((left, right) => (
      (left.state === 'draft' ? 0 : 1) - (right.state === 'draft' ? 0 : 1)
      || left.trimMode.localeCompare(right.trimMode)
      || left.key.localeCompare(right.key)
    ));
    const activeVariant = sortedVariantEntries.find((entry) => entry.key === selectedVariantId)
      ?? sortedVariantEntries.find((entry) => (
        rangeDraftVariants.some((variant) => variant.id === entry.key)
      ))
      ?? sortedVariantEntries[0]
      ?? buildFallbackActiveVariant(range, defaultTrimMode);
    const isRangeLocked = sortedVariantEntries.some((entry) => (
      entry.status === 'exported' || entry.status === 'legacy' || entry.isLocked
    ));
    const exportedVariantCount = sortedVariantEntries.filter((entry) => (
      entry.status === 'exported' || entry.status === 'legacy'
    )).length;
    const exportingVariantCount = sortedVariantEntries.filter((entry) => (
      entry.status === 'exporting'
    )).length;
    const draftVariantCount = sortedVariantEntries.filter((entry) => (
      entry.status === 'draft' || entry.status === 'planned' || entry.status === 'failed'
    )).length;

    return {
      activeVariant,
      exportedVariantCount,
      exportingVariantCount,
      draftVariantCount,
      range,
      trustedExistingCount: trustedExistingClips.length,
      variantEntries: sortedVariantEntries,
      existingClips: trustedExistingClips,
      currentModeClip: trustedExistingClips.find(
        (clip) => clip.trimMode === activeVariant?.trimMode,
      ) ?? null,
      isLocked: isRangeLocked,
    } satisfies ClipEntry;
  });
