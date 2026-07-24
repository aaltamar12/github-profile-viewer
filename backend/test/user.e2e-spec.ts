import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import request from 'supertest';
import { App } from 'supertest/types';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosHeaders } from 'axios';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';

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

describe('User endpoints (e2e)', () => {
  let app: INestApplication<App>;
  const httpService = { get: jest.fn() };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(httpService)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    httpService.get.mockReset();
  });

  describe('GET /user/:username', () => {
    it('returns the profile shaped for the frontend', async () => {
      httpService.get.mockReturnValueOnce(
        of({
          data: {
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
          },
        }),
      );

      const res = await request(app.getHttpServer())
        .get('/user/aaltamar12')
        .expect(200);

      expect(res.body).toMatchObject({
        login: 'aaltamar12',
        publicRepos: 128,
        htmlUrl: 'https://github.com/aaltamar12',
      });
    });

    it('returns 404 when GitHub has no such user', async () => {
      httpService.get.mockReturnValueOnce(throwError(() => axiosError(404)));

      await request(app.getHttpServer())
        .get('/user/does-not-exist')
        .expect(404);
    });

    it('returns 429 when GitHub rate-limits the request', async () => {
      httpService.get.mockReturnValueOnce(throwError(() => axiosError(403)));

      await request(app.getHttpServer()).get('/user/aaltamar12').expect(429);
    });
  });

  describe('GET /user/search', () => {
    it('rejects queries shorter than 3 characters', async () => {
      await request(app.getHttpServer()).get('/user/search?q=ab').expect(400);
    });

    it('rejects a missing query', async () => {
      await request(app.getHttpServer()).get('/user/search').expect(400);
    });

    it('returns matching users for a valid query', async () => {
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

      const res = await request(app.getHttpServer())
        .get('/user/search?q=tor')
        .expect(200);

      expect(res.body).toEqual([
        {
          login: 'torvalds',
          avatarUrl: 'https://avatars.githubusercontent.com/u/2',
          htmlUrl: 'https://github.com/torvalds',
        },
      ]);
    });
  });
});
