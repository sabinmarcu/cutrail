import {
  useMemo,
  useRef,
  useState,
} from 'react';
import { normalizeVideoPath } from './clipping';

export const useClippingState = ({ initialSourcePath }) => {
  const videoReference = useRef(null);
  const timelineReference = useRef(null);
  const [sourcePath, setSourcePath] = useState(initialSourcePath);
  const [outputDirectory, setOutputDirectory] = useState('');
  const [ranges, setRanges] = useState([]);
  const [plan, setPlan] = useState({
    jobs: [],
    errors: [],
  });
  const [runResult, setRunResult] = useState(null);
  const [progressById, setProgressById] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [trimMode, setTrimMode] = useState('accurate');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRangeId, setSelectedRangeId] = useState(null);
  const videoUrl = useMemo(() => normalizeVideoPath(sourcePath), [sourcePath]);
  const readyToStart = sourcePath.length > 0 && outputDirectory.length > 0 && ranges.length > 0;

  const clipStatusMap = useMemo(() => {
    const results = runResult?.results ?? [];
    const statusByJobId = Object.fromEntries(results.map((result) => [result.jobId, result.status]));
    const plannedIds = new Set(plan.jobs.map((job) => job.id));

    return Object.fromEntries(ranges.map((range) => {
      if (statusByJobId[range.id]) {
        return [range.id, statusByJobId[range.id]];
      }

      return [range.id, plannedIds.has(range.id) ? 'PLANNED' : 'DRAFT'];
    }));
  }, [plan.jobs, ranges, runResult]);

  return {
    clipStatusMap,
    currentTime,
    duration,
    errorMessage,
    isPlaying,
    outputDirectory,
    plan,
    progressById,
    ranges,
    readyToStart,
    runResult,
    selectedRangeId,
    setCurrentTime,
    setDuration,
    setErrorMessage,
    setIsPlaying,
    setOutputDirectory,
    setPlan,
    setProgressById,
    setRanges,
    setRunResult,
    setSelectedRangeId,
    setSourcePath,
    setTrimMode,
    sourcePath,
    timelineRef: timelineReference,
    trimMode,
    videoRef: videoReference,
    videoUrl,
  };
};
