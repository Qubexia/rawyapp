import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface DiscoverPodcast {
  id: string; // Internal id can just be appleId for discovery
  title: string;
  description: string;
  feedUrl: string;
  artworkUrl: string;
  author: string;
  appleId: string;
}

@Injectable()
export class AppleApiService {
  private readonly logger = new Logger(AppleApiService.name);
  private readonly TOP_PODCASTS_URL =
    'https://itunes.apple.com/eg/rss/toppodcasts/limit=100/json';
  private readonly LOOKUP_URL = 'https://itunes.apple.com/lookup';
  private readonly SEARCH_URL = 'https://itunes.apple.com/search';

  constructor(private readonly httpService: HttpService) {}

  async fetchTopPodcasts(): Promise<DiscoverPodcast[]> {
    try {
      this.logger.log(`Fetching top podcasts from ${this.TOP_PODCASTS_URL}`);
      const rssResponse = await firstValueFrom(
        this.httpService.get(this.TOP_PODCASTS_URL),
      );

      const entries = rssResponse.data?.feed?.entry || [];
      if (!entries.length) {
        return [];
      }

      // Extract basic info and collect Apple IDs for batch lookup
      const podcastMappers = entries.map((entry: any) => {
        const images = entry['im:image'] || [];
        const largestImage =
          images.length > 0 ? images[images.length - 1].label : '';

        return {
          appleId: entry.id?.attributes?.['im:id'],
          title:
            entry['title']?.label || entry['im:name']?.label || 'Unknown Title',
          description: entry.summary?.label || 'No description available',
          artworkUrl: largestImage,
          author: entry['im:artist']?.label || 'Unknown Author',
        };
      });

      const appleIds = podcastMappers
        .map((p: any) => p.appleId)
        .filter(Boolean);

      // Batch lookup to get RSS feedUrls
      this.logger.log(
        `Fetching lookup details for ${appleIds.length} podcasts`,
      );
      const lookupResponse = await firstValueFrom(
        this.httpService.get(
          `${this.LOOKUP_URL}?id=${appleIds.join(',')}&entity=podcast`,
        ),
      );

      const lookupResults = lookupResponse.data?.results || [];
      const lookupMap = new Map();

      for (const result of lookupResults) {
        if (result.trackId && result.feedUrl) {
          lookupMap.set(result.trackId.toString(), result.feedUrl);
        }
      }

      // Merge feedUrls into final objects
      const finalPodcasts: DiscoverPodcast[] = podcastMappers.map((p: any) => {
        return {
          id: p.appleId, // Use appleId as temporary ID for un-imported podcasts
          title: p.title,
          description: p.description,
          feedUrl: lookupMap.get(p.appleId) || '',
          artworkUrl: p.artworkUrl,
          author: p.author,
          appleId: p.appleId,
        };
      });

      return finalPodcasts;
    } catch (error) {
      this.logger.error('Failed to fetch top podcasts from Apple', error.stack);
      return [];
    }
  }

  async searchPodcasts(query: string): Promise<DiscoverPodcast[]> {
    try {
      this.logger.log(`Searching Apple podcasts for: ${query}`);
      const searchResponse = await firstValueFrom(
        this.httpService.get(
          `${this.SEARCH_URL}?term=${encodeURIComponent(query)}&entity=podcast&country=eg&limit=20`,
        ),
      );

      const results = searchResponse.data?.results || [];

      return results.map((result: any) => ({
        id: result.trackId?.toString(),
        title: result.collectionName || result.trackName || 'Unknown Title',
        description: 'Description not provided in search API',
        feedUrl: result.feedUrl || '',
        artworkUrl: result.artworkUrl600 || result.artworkUrl100 || '',
        author: result.artistName || 'Unknown Author',
        appleId: result.trackId?.toString(),
      }));
    } catch (error) {
      this.logger.error('Failed to search podcasts on Apple API', error?.stack);
      return [];
    }
  }

  async lookupPodcast(appleId: string): Promise<DiscoverPodcast | null> {
    try {
      this.logger.log(`Looking up Apple podcast by ID: ${appleId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.LOOKUP_URL}?id=${appleId}&entity=podcast`),
      );
      
      const result = response.data?.results?.[0];
      if (!result) return null;

      return {
        id: result.trackId?.toString(),
        title: result.collectionName || result.trackName || 'Unknown Title',
        description: 'Imported from Apple Podcasts',
        feedUrl: result.feedUrl || '',
        artworkUrl: result.artworkUrl600 || result.artworkUrl100 || '',
        author: result.artistName || 'Unknown Author',
        appleId: result.trackId?.toString(),
      };
    } catch (error) {
      this.logger.error(`Failed to lookup podcast with ID ${appleId}`, error?.stack);
      return null;
    }
  }
}
