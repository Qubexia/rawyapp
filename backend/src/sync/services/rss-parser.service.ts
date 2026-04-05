import { Injectable, Logger } from '@nestjs/common';
const Parser = require('rss-parser');

@Injectable()
export class RssParserService {
  private readonly logger = new Logger(RssParserService.name);
  private parser: any;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['itunes:image', 'itunesImage'],
          ['itunes:duration', 'itunesDuration'],
        ],
      },
    });
  }

  async parseFeed(feedUrl: string) {
    try {
      this.logger.debug(`Parsing RSS feed: ${feedUrl}`);
      const feed = await this.parser.parseURL(feedUrl);
      return feed;
    } catch (error) {
      this.logger.error(`Error parsing RSS feed ${feedUrl}:`, error.stack);
      throw error;
    }
  }
}
