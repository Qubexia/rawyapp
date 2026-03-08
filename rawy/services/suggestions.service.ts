/**
 * Suggestions service — get suggested users to follow.
 */

import axiosClient from './axios-client';

export interface SuggestedUser {
    id: string;
    name: string;
    avatarUrl?: string;
    followerCount: number;
    city?: string;
}

/**
 * Fetch a list of recommended users to follow based on proximity or popularity.
 */
export async function getSuggestions(limit = 10): Promise<SuggestedUser[]> {
    const { data } = await axiosClient.get<SuggestedUser[]>('/suggestions', {
        params: { limit },
    });
    return data;
}

export default {
    getSuggestions,
};
