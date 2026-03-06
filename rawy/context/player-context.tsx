import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as ExpoAudio from 'expo-audio';
import { Episode } from '@/services/episodes.service';
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

interface PlayerContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  position: number;        // milliseconds
  duration: number;        // milliseconds
  playEpisode: (episode: Episode) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (millis: number) => Promise<void>;
  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;
  dismiss: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const SKIP_MS = 15_000; // 15 seconds

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Configure audio session once on mount
  useEffect(() => {
    ExpoAudio.setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
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
        try { player.play(); } catch {}
      }, 300);
      return () => clearTimeout(t);
    }
  }, [player, currentEpisode]);

  const playEpisode = async (episode: Episode) => {
    try {
      if (currentEpisode?._id === episode._id) {
        if (!player.playing) player.play();
        return;
      }
      setCurrentEpisode(episode);
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
    try { player?.pause(); } catch {}
    setCurrentEpisode(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    prevEpisodeId.current = null;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        position,
        duration,
        playEpisode,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
        dismiss,
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
