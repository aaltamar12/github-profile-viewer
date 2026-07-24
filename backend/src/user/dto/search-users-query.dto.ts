import { IsString, MinLength } from 'class-validator';

export class SearchUsersQueryDto {
  @IsString()
  @MinLength(3, { message: 'q must be at least 3 characters long' })
  q: string;
}
