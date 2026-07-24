import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { GithubProfileDto } from './dto/github-profile.dto';
import { GithubSearchResultDto } from './dto/github-search-result.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  search(
    @Query() { q }: SearchUsersQueryDto,
  ): Promise<GithubSearchResultDto[]> {
    return this.userService.searchUsers(q.trim());
  }

  @Get(':username')
  getProfile(@Param('username') username: string): Promise<GithubProfileDto> {
    return this.userService.getProfile(username);
  }
}
