import { Test, TestingModule } from '@nestjs/testing';
import { CategoryrequestService } from './categoryrequest.service';

describe('CategoryrequestService', () => {
  let service: CategoryrequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryrequestService],
    }).compile();

    service = module.get<CategoryrequestService>(CategoryrequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
