import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion() {
    return {
      service: 'api',
      version: '0.0.1',
    };
  }
}
