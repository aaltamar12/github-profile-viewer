import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { GithubProfileDto } from './dto/github-profile.dto';
import { GithubSearchResultDto } from './dto/github-search-result.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  search(@Query('q') query?: string): Promise<GithubSearchResultDto[]> {
    if (!query || query.trim().length < 2) {
      return Promise.resolve([]);
    }
    return this.userService.searchUsers(query.trim());
  }

  @Get(':username')
  getProfile(@Param('username') username: string): Promise<GithubProfileDto> {
    return this.userService.getProfile(username);
  }
}
