import { ApiProperty } from '@nestjs/swagger';

export class PaginatedEpisodesDto {
    @ApiProperty({ isArray: true })
    data: any[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}

export class FeedResponseDto {
    @ApiProperty({ type: PaginatedEpisodesDto })
    following: PaginatedEpisodesDto;

    @ApiProperty({ type: PaginatedEpisodesDto })
    recommended: PaginatedEpisodesDto;
}
