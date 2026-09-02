import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getVersion', () => {
    it('returns service metadata', () => {
      expect(appController.getVersion()).toEqual({
        service: 'api',
        version: '0.0.1',
      });
    });
  });
});
