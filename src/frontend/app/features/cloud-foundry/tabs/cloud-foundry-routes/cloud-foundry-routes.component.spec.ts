import { DatePipe } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTestModules } from '../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { ActiveRouteCfOrgSpace } from '../../cf-page.types';
import { CloudFoundryEndpointService } from '../../services/cloud-foundry-endpoint.service';
import { CloudFoundryRoutesComponent } from './cloud-foundry-routes.component';

describe('CloudFoundryRoutesComponent', () => {
  let component: CloudFoundryRoutesComponent;
  let fixture: ComponentFixture<CloudFoundryRoutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloudFoundryRoutesComponent],
      imports: [
        ...BaseTestModules
      ],
      providers: [
        CloudFoundryEndpointService,
        ActiveRouteCfOrgSpace,
        DatePipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudFoundryRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
