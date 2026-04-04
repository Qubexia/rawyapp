/**
 * Audio recording utility for in-app episode recording.
 *
 * Provides a session-based API for start/pause/resume/stop recording
 * using expo-audio's useAudioRecorder hook pattern, with:
 *  - M4A output format (AAC codec)
 *  - 3-hour maximum recording duration
 *  - AppState listener for background interruption handling
 *  - Duration tracking via an interval timer
 *
 * Usage:
 *   const recording = createRecordingSession();
 *   await recording.start();
 *   recording.pause();
 *   recording.resume();
 *   const result = await recording.stop();
 *   // result.uri → file URI for upload
 */

import { AppState, AppStateStatus } from 'react-native';
import { AudioModule, requestRecordingPermissionsAsync, AudioQuality, type RecordingOptions } from 'expo-audio';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Maximum recording duration in seconds (3 hours) */
export const MAX_RECORDING_DURATION_SEC = 3 * 60 * 60; // 10800 seconds

/** Interval in ms for updating the recording duration display */
const DURATION_TICK_MS = 500;

// ─── Types ───────────────────────────────────────────────────────────────────

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export interface RecordingResult {
  uri: string;
  durationSeconds: number;
  mimeType: string;
  fileName: string;
}

export interface RecordingSession {
  /** Start recording. Requests microphone permission if not yet granted. */
  start: () => Promise<void>;
  /** Pause the active recording. */
  pause: () => Promise<void>;
  /** Resume a paused recording. */
  resume: () => Promise<void>;
  /** Stop and finalize the recording. Returns the result with file URI. */
  stop: () => Promise<RecordingResult>;
  /** Get the current status. */
  getStatus: () => RecordingStatus;
  /** Get the current recording duration in seconds. */
  getDurationSeconds: () => number;
  /** Register a callback for duration tick updates. Returns unsubscribe fn. */
  onDurationUpdate: (cb: (seconds: number) => void) => () => void;
  /** Register a callback for status changes. Returns unsubscribe fn. */
  onStatusChange: (cb: (status: RecordingStatus) => void) => () => void;
  /** Cleanup all resources (call when component unmounts). */
  cleanup: () => void;
}

// ─── Recording Options ───────────────────────────────────────────────────────

/**
 * expo-audio recording options for M4A output.
 * These are passed to useAudioRecorder or Recording.createAsync.
 */
export const RECORDING_OPTIONS: Partial<RecordingOptions> = {
  extension: '.m4a',
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 128000,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    audioQuality: AudioQuality.HIGH,
  },
};

// ─── Session Factory ─────────────────────────────────────────────────────────

export function createRecordingSession(): RecordingSession {
  let status: RecordingStatus = 'idle';
  let durationSeconds = 0;
  let durationTimer: ReturnType<typeof setInterval> | null = null;
  let recordingStartTime: number | null = null;
  let accumulatedDuration = 0; // Duration before current recording segment
  let recorder: any = null;
  let appStateSubscription: any = null;

  const durationListeners: Set<(seconds: number) => void> = new Set();
  const statusListeners: Set<(status: RecordingStatus) => void> = new Set();

  function emitDuration(sec: number) {
    durationSeconds = sec;
    durationListeners.forEach(cb => cb(sec));
  }

  function emitStatus(newStatus: RecordingStatus) {
    status = newStatus;
    statusListeners.forEach(cb => cb(newStatus));
  }

  function startDurationTimer() {
    if (durationTimer) clearInterval(durationTimer);
    recordingStartTime = Date.now();

    durationTimer = setInterval(() => {
      if (recordingStartTime) {
        const elapsed = (Date.now() - recordingStartTime) / 1000;
        const total = Math.floor(accumulatedDuration + elapsed);
        emitDuration(total);

        // Enforce max duration
        if (total >= MAX_RECORDING_DURATION_SEC) {
          stop().catch(console.error);
        }
      }
    }, DURATION_TICK_MS);
  }

  function stopDurationTimer() {
    if (durationTimer) {
      clearInterval(durationTimer);
      durationTimer = null;
    }
    // Accumulate the time from this segment
    if (recordingStartTime) {
      accumulatedDuration += (Date.now() - recordingStartTime) / 1000;
      recordingStartTime = null;
    }
  }

  // ─── AppState interruption handling ──────────────────────────────────────

  function setupAppStateListener() {
    appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
  }

  function handleAppStateChange(nextAppState: AppStateStatus) {
    if (status === 'recording' && nextAppState !== 'active') {
      // App going to background — pause recording
      pause().catch(console.error);
    }
    // Note: we do NOT auto-resume when coming back to foreground.
    // The user should manually resume via the UI to avoid surprises.
  }

  // ─── Session methods ─────────────────────────────────────────────────────

  async function start(): Promise<void> {
    if (status !== 'idle') {
      throw new Error(`Cannot start recording: current status is "${status}"`);
    }

    try {
      // Request microphone permission - exact name from expo-audio 1.1
      const permissionResponse = await requestRecordingPermissionsAsync();
      if (!permissionResponse.granted) {
        throw new Error('Microphone permission was denied');
      }

      // Create and start recording
      // In expo-audio 1.1, AudioRecorder is obtained through AudioModule.
      recorder = new AudioModule.AudioRecorder(RECORDING_OPTIONS);

      await recorder.prepareToRecordAsync();
      recorder.record();

      accumulatedDuration = 0;
      emitStatus('recording');
      console.info(`[audio-recording] Session started at ${new Date().toISOString()}`);
      startDurationTimer();
      setupAppStateListener();
    } catch (err) {
      console.error('[audio-recording] Primary recording approach failed:', err);
      throw err;
    }
  }

  async function pause(): Promise<void> {
    if (status !== 'recording') return;

    try {
      if (recorder) {
        // pause() is sync in expo-audio 1.1
        recorder.pause();
      }
    } catch (err) {
      console.warn('[audio-recording] pause error:', err);
    }
    stopDurationTimer();
    emitStatus('paused');
    console.info(`[audio-recording] Session paused at duration ${accumulatedDuration}s`);
  }

  async function resume(): Promise<void> {
    if (status !== 'paused') return;

    try {
      if (recorder) {
        // record() is used to resume or start in expo-audio 1.1
        recorder.record();
      }
    } catch (err) {
      console.warn('[audio-recording] resume error:', err);
    }
    emitStatus('recording');
    console.info(`[audio-recording] Session resumed at duration ${accumulatedDuration}s`);
    startDurationTimer();
  }

  async function stop(): Promise<RecordingResult> {
    if (status !== 'recording' && status !== 'paused') {
      throw new Error(`Cannot stop recording: current status is "${status}"`);
    }

    stopDurationTimer();
    const finalDuration = Math.floor(accumulatedDuration +
      (recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : 0));

    let uri = '';

    try {
      if (recorder) {
        // stop() is async in expo-audio 1.1
        await recorder.stop();
        uri = recorder.uri || '';
      }
    } catch (err) {
      console.warn('[audio-recording] stop error:', err);
    }

    emitStatus('stopped');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `recording-${timestamp}.m4a`;

    console.info(`[audio-recording] Session stopped. File: ${fileName}, Duration: ${finalDuration}s`);

    return {
      uri,
      durationSeconds: finalDuration,
      mimeType: 'audio/mp4',
      fileName,
    };
  }

  function cleanup() {
    if (durationTimer) clearInterval(durationTimer);
    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }
    durationListeners.clear();
    statusListeners.clear();

    if (recorder && status === 'recording') {
      try {
        recorder.stopAsync?.();
      } catch {}
    }
    recorder = null;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  return {
    start,
    pause,
    resume,
    stop,
    getStatus: () => status,
    getDurationSeconds: () => durationSeconds,
    onDurationUpdate: (cb) => {
      durationListeners.add(cb);
      return () => durationListeners.delete(cb);
    },
    onStatusChange: (cb) => {
      statusListeners.add(cb);
      return () => statusListeners.delete(cb);
    },
    cleanup,
  };
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Format seconds as MM:SS or HH:MM:SS.
 */
export function formatRecordingDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
