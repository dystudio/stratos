import { NgModule } from '@angular/core';

import { CATALOGUE_ENTITIES, EntityCatalogFeatureModule } from '../../store/src/entity-catalog.module';
import { entityCatalog, TestEntityCatalog } from '../../store/src/entity-catalog/entity-catalog.service';

@NgModule({
  imports: [
    {
      ngModule: EntityCatalogFeatureModule,
      providers: [
        {
          provide: CATALOGUE_ENTITIES, useFactory: () => {
            const testEntityCatalog = entityCatalog as TestEntityCatalog;
            testEntityCatalog.clear();
            return [];
          }
        },
      ]
    },
  ]
})
export class StoreTestingModule { }
