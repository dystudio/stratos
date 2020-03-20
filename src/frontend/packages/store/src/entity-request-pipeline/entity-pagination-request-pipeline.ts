import { HttpRequest } from '@angular/common/http';
import { Action, Store } from '@ngrx/store';
import { isObservable, Observable, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import { AppState, InternalAppState } from '../app-state';
import { StratosBaseCatalogEntity, StratosCatalogEntity } from '../entity-catalog/entity-catalog-entity';
import { entityCatalog } from '../entity-catalog/entity-catalog.service';
import { IStratosEntityDefinition } from '../entity-catalog/entity-catalog.types';
import { PaginationFlattenerConfig } from '../helpers/paginated-request-helpers';
import { selectPaginationState } from '../selectors/pagination.selectors';
import { PaginatedAction, PaginationEntityState } from '../types/pagination.types';
import {
  handleJetstreamResponsePipeFactory,
  handleNonJetstreamResponsePipeFactory,
} from './entity-request-base-handlers/handle-multi-endpoints.pipe';
import { makeRequestEntityPipe } from './entity-request-base-handlers/make-request-entity-request.pipe';
import { mapMultiEndpointResponses } from './entity-request-base-handlers/map-multi-endpoint.pipes';
import {
  BasePipelineConfig,
  EntityRequestPipeline,
  PagedJetstreamResponse,
  PipelineResult,
} from './entity-request-pipeline.types';
import { getPaginationParamsPipe } from './pagination-request-base-handlers/get-params.pipe';
import { PaginationPageIterator } from './pagination-request-base-handlers/pagination-iterator.pipe';
import { isJetstreamRequest, singleRequestToPaged } from './pipeline-helpers';
import { PipelineHttpClient } from './pipline-http-client.service';

function getRequestObjectObservable(request: HttpRequest<any> | Observable<HttpRequest<any>>): Observable<HttpRequest<any>> {
  return isObservable(request) ? request : of(request);
}

function getPrePaginatedRequestFunction(catalogEntity: StratosBaseCatalogEntity) {
  const definition = catalogEntity.definition as IStratosEntityDefinition;
  return definition.prePaginationRequest || definition.endpoint.globalPrePaginationRequest || null;
}

function getCompletePaginationAction(action: PaginatedAction, state: PaginationEntityState) {
  return state && state.currentPage ? {
    ...action,
    pageNumber: state.currentPage
  } : action;
}

function getRequestObservable(
  httpClient: PipelineHttpClient,
  action: PaginatedAction,
  request: HttpRequest<any>,
  paginationPageIterator?: PaginationPageIterator
): Observable<PagedJetstreamResponse> {
  const initialRequest = makeRequestEntityPipe(
    httpClient,
    request,
    entityCatalog.getEndpoint(action.endpointType, action.subType),
    action.endpointGuid,
    action.externalRequest
  );
  if (action.flattenPagination && !paginationPageIterator) {
    console.warn('Action requires all request pages but no page flattener was given.');
  }
  if (!action.flattenPagination || !paginationPageIterator) {
    return initialRequest.pipe(map(response => singleRequestToPaged(response)));
  }
  return paginationPageIterator.mergeAllPagesEntities();
}
export interface PaginatedRequestPipelineConfig<T extends AppState = InternalAppState> extends BasePipelineConfig<T> {
  action: PaginatedAction;
  pageFlattenerConfig: PaginationFlattenerConfig;
}
export const basePaginatedRequestPipeline: EntityRequestPipeline = (
  store: Store<AppState>,
  httpClient: PipelineHttpClient,
  { action, requestType, catalogEntity, appState }: PaginatedRequestPipelineConfig
): Observable<PipelineResult> => {
  const prePaginatedRequestFunction = getPrePaginatedRequestFunction(catalogEntity);
  const actionDispatcher = (actionToDispatch: Action) => store.dispatch(actionToDispatch);
  const entity = catalogEntity as StratosCatalogEntity;
  const flattenerConfig = entity.definition.paginationConfig ?
    entity.definition.paginationConfig :
    entity.definition.endpoint ? entity.definition.endpoint.paginationConfig : null;

  // Get pagination state from the store
  const paginationState = selectPaginationState(
    catalogEntity.entityKey,
    action.paginationKey,
  )(appState);

  const paramsFromStore = getPaginationParamsPipe(action, paginationState);

  const completePaginationAction = getCompletePaginationAction(action, paginationState);
  const requestFromAction = completePaginationAction.options;
  const requestFromStore = requestFromAction.clone({
    params: paramsFromStore
  });
  const request = prePaginatedRequestFunction ?
    prePaginatedRequestFunction(requestFromStore, completePaginationAction, catalogEntity, appState) :
    requestFromStore;

  const handleMultiEndpointsPipe = isJetstreamRequest(entity.definition) ?
    handleJetstreamResponsePipeFactory(
      completePaginationAction.options.url,
      flattenerConfig
    ) : handleNonJetstreamResponsePipeFactory(
      completePaginationAction.options.url,
      entity.definition.nonJetstreamRequestHandler,
      flattenerConfig
    );

  // Keep, helpful for debugging below chain via tap
  // const debug = (val, location) => console.log(`${entity.endpointType}:${entity.entityKey}:${location}: `, val);

  return getRequestObjectObservable(request).pipe(
    first(),
    switchMap(requestObject => {
      const pageIterator = flattenerConfig ?
        new PaginationPageIterator(
          httpClient,
          requestObject,
          completePaginationAction,
          actionDispatcher,
          flattenerConfig,
          paginationState ? paginationState.maxedState.ignoreMaxed : false) :
        null;
      return getRequestObservable(
        httpClient,
        completePaginationAction,
        requestObject,
        pageIterator
      ).pipe(
        // Convert { [endpointGuid]: <raw response> } to { { errors: [], successes: [] } }
        map(handleMultiEndpointsPipe),
        // Convert { { errors: [], successes: [] } } to { response: NormalisedResponse, success: boolean }
        map(multiEndpointResponses => mapMultiEndpointResponses(
          completePaginationAction,
          catalogEntity,
          requestType,
          multiEndpointResponses,
          actionDispatcher
        )),
      );
    })
  );
};
