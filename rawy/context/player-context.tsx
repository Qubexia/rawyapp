import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as ExpoAudio from 'expo-audio';
import { Episode } from '@/services/episodes.service';
import { recordView } from '@/services/views.service';
import { useAuthContext } from '@/context/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { episodeKeys } from '@/hooks/queries/use-episodes';
import { SERVER_URL } from '@/services/axios-client';
import { resolveImageUrl } from '@/utils/url';

// Resolve audio URL — stored as relative path from backend
function resolveAudioUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // Use the same logic as resolveImageUrl but for audio
  const normalizedPath = path.replace(/\\/g, '/').replace(/^\//, '');
  return `${SERVER_URL}/${normalizedPath}`;
}

// Enable lock screen controls — required on Android for sustained background playback
function enableLockScreen(player: { setActiveForLockScreen?: (active: boolean, metadata?: object) => void }, episode: Episode) {
  try {
    if (typeof player.setActiveForLockScreen === 'function') {
      // Prefer episode-level artwork (common for external RSS episodes), fall back to podcast cover
      const artwork = episode.artworkUrl
        ? resolveImageUrl(episode.artworkUrl)
        : resolveImageUrl(episode.podcast?.coverImageUrl);

      player.setActiveForLockScreen(true, {
        title: episode.title,
        artist: episode.creator?.name ?? 'Rawy',
        albumTitle: episode.podcast?.title ?? '',
        artworkUrl: artwork,
      });
    }
  } catch { }
}

function disableLockScreen(player: { setActiveForLockScreen?: (active: boolean) => void }) {
  try {
    if (typeof player.setActiveForLockScreen === 'function') {
      player.setActiveForLockScreen(false);
    }
  } catch { }
}interface PlayerContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  isDismissed: boolean;
  position: number;        // milliseconds
  duration: number;        // milliseconds
  playEpisode: (episode: Episode) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (millis: number) => Promise<void>;
  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;
  dismiss: () => void;
  trackView: (episodeId: string) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const SKIP_MS = 15_000; // 15 seconds

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const viewedEpisodeIds = useRef(new Set<string>());

  const trackView = async (episodeId: string) => {
    if (!isAuthenticated || viewedEpisodeIds.current.has(episodeId)) return;
    try {
      await recordView(episodeId);
      viewedEpisodeIds.current.add(episodeId);
      // Refresh episode details to reflect new view count
      queryClient.invalidateQueries({ queryKey: episodeKeys.detail(episodeId) });
    } catch (err) {
      console.error('[PlayerContext] trackView error:', err);
    }
  };

  // Configure audio session once on mount and enable background playback
  useEffect(() => {
    ExpoAudio.setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldPlayInBackground: true,
    }).catch(() => { });
  }, []);

  // Resolve to full URL for the audio player
  const audioUrl = resolveAudioUrl(currentEpisode?.audioFileUrl);
  const player = ExpoAudio.useAudioPlayer(audioUrl);

  // Poll playback state every 500ms
  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      setPosition(player.currentTime * 1000);
      setDuration(player.duration * 1000);
      setIsPlaying(player.playing);
    }, 500);
    return () => clearInterval(interval);
  }, [player]);

  // Auto-play whenever currentEpisode changes and player source updates
  const prevEpisodeId = useRef<string | null>(null);
  useEffect(() => {
    if (!player || !currentEpisode) return;
    if (currentEpisode._id !== prevEpisodeId.current) {
      prevEpisodeId.current = currentEpisode._id;
      // Small delay to let expo-audio load the new source
      const t = setTimeout(() => {
        try {
          enableLockScreen(player, currentEpisode);
          player.play();
        } catch { }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [player, currentEpisode]);

  const playEpisode = async (episode: Episode) => {
    try {
      setIsDismissed(false);
      if (currentEpisode?._id === episode._id) {
        if (!player.playing) {
          enableLockScreen(player, episode);
          player.play();
        }
        return;
      }
      setCurrentEpisode(episode);
      trackView(episode._id).catch(() => { });
    } catch (error) {
      console.error('[PlayerContext] playEpisode error:', error);
      Alert.alert('Error', 'Failed to play episode');
    }
  };

  const togglePlay = async () => {
    if (!player) return;
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      setIsDismissed(false);
      if (currentEpisode) enableLockScreen(player, currentEpisode);
      player.play();
      setIsPlaying(true);
    }
  };

  const seek = async (millis: number) => {
    if (!player) return;
    player.seekTo(millis / 1000);
  };

  const skipForward = async () => {
    if (!player) return;
    const next = Math.min((player.currentTime * 1000) + SKIP_MS, player.duration * 1000);
    player.seekTo(next / 1000);
  };

  const skipBackward = async () => {
    if (!player) return;
    const prev = Math.max((player.currentTime * 1000) - SKIP_MS, 0);
    player.seekTo(prev / 1000);
  };

  const dismiss = () => {
    try {
      if (typeof player?.setActiveForLockScreen === 'function') {
        player.setActiveForLockScreen(false);
      }
      player?.pause();
    } catch { }
    // HACK: To hide the miniplayer, set isDismissed to true
    // DO NOT clear currentEpisode so it persists in the Home Hero
    setIsDismissed(true);
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        isDismissed,
        position,
        duration,
        playEpisode,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
        dismiss,
        trackView,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
