import { AppState, AppStateStatus } from 'react-native';
import { createRecordingSession, MAX_RECORDING_DURATION_SEC, formatRecordingDuration } from '../audio-recording';

// Mock expo-audio
const mockStartAsync = jest.fn();
const mockPauseAsync = jest.fn();
const mockStopAsync = jest.fn();
const mockPrepareToRecordAsync = jest.fn();
const mockRequestRecordingPermission = jest.fn().mockResolvedValue({ granted: true });

jest.mock('expo-audio', () => {
  return {
    requestRecordingPermission: () => mockRequestRecordingPermission(),
    AudioRecorder: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: mockPrepareToRecordAsync,
      startAsync: mockStartAsync,
      pauseAsync: mockPauseAsync,
      stopAsync: mockStopAsync,
      uri: 'file:///mock/path/audio.m4a',
    })),
  };
});

// Mock AppState
jest.mock('react-native', () => {
  const listeners: ((state: AppStateStatus) => void)[] = [];
  return {
    AppState: {
      addEventListener: jest.fn((event, handler) => {
        listeners.push(handler);
        return { remove: jest.fn() };
      }),
    },
  };
});

describe('audio-recording utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatRecordingDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatRecordingDuration(0)).toBe('0:00');
      expect(formatRecordingDuration(5)).toBe('0:05');
      expect(formatRecordingDuration(65)).toBe('1:05');
      expect(formatRecordingDuration(3600)).toBe('1:00:00');
    });
  });

  describe('createRecordingSession lifecycle', () => {
    it('T031: handles start, pause, resume, and stop correctly', async () => {
      const session = createRecordingSession();
      
      expect(session.getStatus()).toBe('idle');
      
      await session.start();
      expect(mockRequestRecordingPermission).toHaveBeenCalled();
      expect(mockStartAsync).toHaveBeenCalled();
      expect(session.getStatus()).toBe('recording');

      await session.pause();
      expect(mockPauseAsync).toHaveBeenCalled();
      expect(session.getStatus()).toBe('paused');

      await session.resume();
      expect(mockStartAsync).toHaveBeenCalledTimes(2);
      expect(session.getStatus()).toBe('recording');

      const result = await session.stop();
      expect(mockStopAsync).toHaveBeenCalled();
      expect(session.getStatus()).toBe('stopped');
      expect(result.uri).toBe('file:///mock/path/audio.m4a');
      expect(result.mimeType).toBe('audio/mp4');
    });

    it('T032: tracks duration accurately and enforces max duration', async () => {
      const session = createRecordingSession();
      let lastDuration = 0;
      session.onDurationUpdate((d) => { lastDuration = d; });

      await session.start();
      
      // Advance by 10s
      jest.advanceTimersByTime(10000);
      expect(lastDuration).toBe(10);
      
      // Advance past max duration
      jest.advanceTimersByTime(MAX_RECORDING_DURATION_SEC * 1000);
      
      // Since max duration is reached, it should auto-stop
      // The interval callback is asynchronous, but we can check if stop was called
      expect(session.getStatus()).toBe('stopped');
    });

    it('T033: handles app interruptions (background pause)', async () => {
      const session = createRecordingSession();
      await session.start();
      expect(session.getStatus()).toBe('recording');

      // Simulate app going to background
      const listeners = (AppState.addEventListener as jest.Mock).mock.calls;
      const handler = listeners[0][1];
      
      // Go to background
      handler('background');
      
      // Since pause() returns a promise, we need to wait a tick
      await Promise.resolve();
      
      expect(session.getStatus()).toBe('paused');
      expect(mockPauseAsync).toHaveBeenCalled();
    });

    it('throws if starting without permission', async () => {
      mockRequestRecordingPermission.mockResolvedValueOnce({ granted: false });
      const session = createRecordingSession();
      
      await expect(session.start()).rejects.toThrow('Microphone permission was denied');
    });
  });
});
