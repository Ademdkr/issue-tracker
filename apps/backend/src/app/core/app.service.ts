import { Injectable } from '@nestjs/common';
import { MessageResponse } from '@issue-tracker/shared-types';

@Injectable()
export class AppService {
  getData(): MessageResponse {
    return { message: 'Hello API' };
  }
}
