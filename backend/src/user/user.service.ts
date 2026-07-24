import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { GithubProfileDto } from './dto/github-profile.dto';
import { GithubSearchResultDto } from './dto/github-search-result.dto';

interface GithubUserResponse {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
}

interface GithubSearchUsersResponse {
  items: {
    login: string;
    avatar_url: string;
    html_url: string;
  }[];
}

const RATE_LIMIT_MESSAGE =
  'Se alcanzó el límite de peticiones a la API de GitHub. Intentá de nuevo en unos minutos.';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private githubHeaders() {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    return {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getProfile(username: string): Promise<GithubProfileDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GithubUserResponse>(
          `https://api.github.com/users/${encodeURIComponent(username)}`,
          { headers: this.githubHeaders() },
        ),
      );

      return {
        login: data.login,
        name: data.name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        company: data.company,
        location: data.location,
        blog: data.blog,
        twitterUsername: data.twitter_username,
        publicRepos: data.public_repos,
        followers: data.followers,
        following: data.following,
        htmlUrl: data.html_url,
        createdAt: data.created_at,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException(
            `No existe ningún usuario de GitHub llamado "${username}"`,
          );
        }
        if (error.response?.status === 403) {
          throw new HttpException(RATE_LIMIT_MESSAGE, 429);
        }
      }
      throw new InternalServerErrorException(
        'No se pudo obtener el perfil de GitHub en este momento.',
      );
    }
  }

  async searchUsers(query: string): Promise<GithubSearchResultDto[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GithubSearchUsersResponse>(
          'https://api.github.com/search/users',
          {
            headers: this.githubHeaders(),
            params: { q: `${query} in:login`, per_page: 6 },
          },
        ),
      );

      return data.items.map((item) => ({
        login: item.login,
        avatarUrl: item.avatar_url,
        htmlUrl: item.html_url,
      }));
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        throw new HttpException(RATE_LIMIT_MESSAGE, 429);
      }
      throw new InternalServerErrorException(
        'No se pudo buscar usuarios en este momento.',
      );
    }
  }
}
