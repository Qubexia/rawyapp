import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as ExpoAudio from 'expo-audio';
import { Episode } from '@/services/episodes.service';

interface PlayerContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playEpisode: (episode: Episode) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // in millis
  const [duration, setDuration] = useState(0); // in millis

  // Create a single audio player instance
  // Note: We'll update the source when playEpisode is called.
  const player = ExpoAudio.useAudioPlayer(currentEpisode?.audioFileUrl || '');

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      setPosition(player.currentTime * 1000);
      setDuration(player.duration * 1000);
      setIsPlaying(player.playing);
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  const playEpisode = async (episode: Episode) => {
    try {
      if (currentEpisode?._id === episode._id) {
        player.play();
        return;
      }

      setCurrentEpisode(episode);
      // The player source will update via the useAudioPlayer hook dependency on the URL
      // However, we might need to explicitly play it after the source changes.
      // With expo-audio, setting the source might reset the player.
    } catch (error) {
      console.error('[PlayerContext] playEpisode error:', error);
      Alert.alert('Error', 'Failed to play episode');
    }
  };

  const togglePlay = async () => {
    if (!player) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(player.playing);
  };

  const seek = async (seconds: number) => {
    if (!player) return;
    player.seekTo(seconds);
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
