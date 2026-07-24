import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosHeaders } from 'axios';
import { of, throwError } from 'rxjs';
import { UserService } from './user.service';

function axiosError(status: number): AxiosError {
  return new AxiosError(
    'Request failed',
    String(status),
    undefined,
    undefined,
    {
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: undefined,
    },
  );
}

describe('UserService', () => {
  let service: UserService;
  let httpService: { get: jest.Mock };

  beforeEach(async () => {
    httpService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    service = module.get(UserService);
  });

  describe('getProfile', () => {
    const githubResponse = {
      login: 'aaltamar12',
      name: 'Alfonso Altamar Montero',
      avatar_url: 'https://avatars.githubusercontent.com/u/1',
      bio: null,
      company: null,
      location: 'Medellín, Colombia',
      blog: '',
      twitter_username: null,
      public_repos: 128,
      followers: 4,
      following: 2,
      html_url: 'https://github.com/aaltamar12',
      created_at: '2020-06-10T07:05:40Z',
    };

    it('maps the GitHub response to camelCase', async () => {
      httpService.get.mockReturnValueOnce(of({ data: githubResponse }));

      const profile = await service.getProfile('aaltamar12');

      expect(profile).toEqual({
        login: 'aaltamar12',
        name: 'Alfonso Altamar Montero',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
        bio: null,
        company: null,
        location: 'Medellín, Colombia',
        blog: '',
        twitterUsername: null,
        publicRepos: 128,
        followers: 4,
        following: 2,
        htmlUrl: 'https://github.com/aaltamar12',
        createdAt: '2020-06-10T07:05:40Z',
      });
    });

    it('serves the second request for the same username from cache', async () => {
      httpService.get.mockReturnValueOnce(of({ data: githubResponse }));

      await service.getProfile('aaltamar12');
      await service.getProfile('AALTAMAR12');

      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when GitHub responds 404', async () => {
      httpService.get.mockReturnValueOnce(throwError(() => axiosError(404)));

      await expect(service.getProfile('does-not-exist')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws a 429 HttpException when GitHub rate-limits the request', async () => {
      httpService.get.mockReturnValueOnce(throwError(() => axiosError(403)));

      await expect(service.getProfile('aaltamar12')).rejects.toMatchObject({
        status: 429,
      });
    });

    it('throws InternalServerErrorException for anything else', async () => {
      httpService.get.mockReturnValueOnce(
        throwError(() => new Error('network down')),
      );

      await expect(service.getProfile('aaltamar12')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('searchUsers', () => {
    it('maps search results to the simplified shape', async () => {
      httpService.get.mockReturnValueOnce(
        of({
          data: {
            items: [
              {
                login: 'torvalds',
                avatar_url: 'https://avatars.githubusercontent.com/u/2',
                html_url: 'https://github.com/torvalds',
              },
            ],
          },
        }),
      );

      const results = await service.searchUsers('tor');

      expect(results).toEqual([
        {
          login: 'torvalds',
          avatarUrl: 'https://avatars.githubusercontent.com/u/2',
          htmlUrl: 'https://github.com/torvalds',
        },
      ]);
    });

    it('serves the second request for the same query from cache', async () => {
      httpService.get.mockReturnValueOnce(
        of({
          data: {
            items: [
              {
                login: 'torvalds',
                avatar_url: 'https://avatars.githubusercontent.com/u/2',
                html_url: 'https://github.com/torvalds',
              },
            ],
          },
        }),
      );

      await service.searchUsers('tor');
      await service.searchUsers('TOR');

      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('surfaces rate limiting as a 429 HttpException', async () => {
      httpService.get.mockReturnValueOnce(throwError(() => axiosError(403)));

      await expect(service.searchUsers('tor')).rejects.toBeInstanceOf(
        HttpException,
      );
    });

    it('throws InternalServerErrorException for anything else', async () => {
      httpService.get.mockReturnValueOnce(
        throwError(() => new Error('network down')),
      );

      await expect(service.searchUsers('tor')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
