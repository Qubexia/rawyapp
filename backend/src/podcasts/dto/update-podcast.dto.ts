import { PartialType } from '@nestjs/swagger';
import { CreatePodcastDto } from './create-podcast.dto';

export class UpdatePodcastDto extends PartialType(CreatePodcastDto) {}
