import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { ClearPaginationOfEntity } from '../actions/pagination.actions';
import { RouteEvents, UnmapRoute } from '../actions/route.actions';
import { AppState } from '../app-state';
import { routeSchemaKey } from '../helpers/entity-factory';
import { APISuccessOrFailedAction } from '../types/request.types';

@Injectable()
export class RouteEffect {

  constructor(
    private actions$: Actions,
    private store: Store<AppState>
  ) { }

  @Effect({ dispatch: false })
  unmapEffect$ = this.actions$.ofType<APISuccessOrFailedAction>(RouteEvents.UNMAP_ROUTE_SUCCESS).pipe(
    map((action: APISuccessOrFailedAction) => {
      const unmapAction: UnmapRoute = action.apiAction as UnmapRoute;
      if (unmapAction.clearPaginationKey) {
        // Remove the route from the specified pagination list
        this.store.dispatch(new ClearPaginationOfEntity(routeSchemaKey, action.apiAction.guid, unmapAction.clearPaginationKey));
      }
    })
  );
}
