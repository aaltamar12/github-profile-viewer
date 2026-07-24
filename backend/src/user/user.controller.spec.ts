import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: { getProfile: jest.Mock; searchUsers: jest.Mock };

  beforeEach(async () => {
    service = { getProfile: jest.fn(), searchUsers: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: service }],
    }).compile();

    controller = module.get(UserController);
  });

  it('delegates profile lookups to UserService', async () => {
    service.getProfile.mockResolvedValueOnce({ login: 'aaltamar12' });

    const result = await controller.getProfile('aaltamar12');

    expect(service.getProfile).toHaveBeenCalledWith('aaltamar12');
    expect(result).toEqual({ login: 'aaltamar12' });
  });

  it('trims the query before delegating to UserService', async () => {
    service.searchUsers.mockResolvedValueOnce([]);

    await controller.search({ q: '  tor  ' });

    expect(service.searchUsers).toHaveBeenCalledWith('tor');
  });
});
