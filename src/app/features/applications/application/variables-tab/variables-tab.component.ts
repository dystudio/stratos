import { CfAppEvnVarsDataSource } from '../../../../shared/data-sources/cf-app-variables-data-source';
import { CfAppVariablesListConfigService } from '../../../../shared/list-configs/cf-app-variables-list-config.service';
import { ListConfig } from '../../../../shared/components/list/list.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app-state';
import { ApplicationService } from '../../application.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  CardAppVariableComponent,
} from '../../../../shared/components/cards/custom-cards/card-app-variable/card-app-variable.component';

@Component({
  selector: 'app-variables-tab',
  templateUrl: './variables-tab.component.html',
  styleUrls: ['./variables-tab.component.scss'],
  providers: [{
    provide: ListConfig,
    useClass: CfAppVariablesListConfigService,
  }]
})
export class VariablesTabComponent implements OnInit {

  constructor(
    private store: Store<AppState>,
    private appService: ApplicationService,
    private listConfig: ListConfig
  ) {
    this.envVarsDataSource = listConfig.getDataSource() as CfAppEvnVarsDataSource;
  }

  envVarsNames$: Observable<String[]>;
  envVars$: Observable<any>;
  cardComponent = CardAppVariableComponent;
  envVarsDataSource: CfAppEvnVarsDataSource;
  envVarNames: string[];

  ngOnInit() {
    this.envVarsNames$ = this.appService.waitForAppEntity$.map(app => {
      return app.entity.entity.environment_json ? Object.keys(app.entity.entity.environment_json) : [];
    });
    this.envVars$ = this.appService.waitForAppEntity$.map(app => {
      return app.entity.entity.environment_json || {};
    });
  }

}
