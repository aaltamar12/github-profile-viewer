import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { GithubProfileDto } from './dto/github-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':username')
  getProfile(@Param('username') username: string): Promise<GithubProfileDto> {
    return this.userService.getProfile(username);
  }
}
