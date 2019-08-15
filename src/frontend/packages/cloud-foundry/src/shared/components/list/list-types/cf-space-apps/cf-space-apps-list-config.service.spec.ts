import { DatePipe } from '@angular/common';
import { inject, TestBed } from '@angular/core/testing';

import { BaseTestModules } from '../../../../../../../core/test-framework/cloud-foundry-endpoint-service.helper';
import { CloudFoundrySpaceServiceMock } from '../../../../../../../core/test-framework/cloud-foundry-space.service.mock';
import { CloudFoundrySpaceService } from '../../../../../features/cloud-foundry/services/cloud-foundry-space.service';
import { CfSpaceAppsListConfigService } from './cf-space-apps-list-config.service';

describe('CfSpaceAppsListConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CfSpaceAppsListConfigService,
        DatePipe,
        { provide: CloudFoundrySpaceService, useClass: CloudFoundrySpaceServiceMock }
      ],
      imports: [...BaseTestModules]
    });
  });

  it('should be created', inject([CfSpaceAppsListConfigService], (service: CfSpaceAppsListConfigService) => {
    expect(service).toBeTruthy();
  }));
});