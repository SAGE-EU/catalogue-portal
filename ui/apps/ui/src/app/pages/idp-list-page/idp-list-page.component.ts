import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  startWith,
  tap,
} from 'rxjs';
import { IdpListService } from './idp-list.service';
import { IdpListItem, IdpListResponse } from './idp-list.types';

type IdpListState =
  | { status: 'loading' }
  | { status: 'loaded'; response: IdpListResponse }
  | { status: 'error'; message: string };

@Component({
  selector: 'ess-idp-list-page',
  templateUrl: './idp-list-page.component.html',
  styleUrls: ['./idp-list-page.component.scss'],
})
export class IdpListPageComponent implements OnDestroy {
  private intersectionObserver?: IntersectionObserver;
  @ViewChild('loadMoreSentinel')
  set loadMoreSentinel(element: ElementRef<HTMLElement> | undefined) {
    this.intersectionObserver?.disconnect();
    if (typeof IntersectionObserver === 'undefined' || !element) return;
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) this.loadNextPage();
      },
      { rootMargin: '400px' }
    );
    this.intersectionObserver.observe(element.nativeElement);
  }
  readonly pageSize = 20;
  readonly connectorPages: IdpListItem[][] = [];
  currentPage = 0;
  totalPages = 1;
  totalCount = 0;
  loadingNextPage = false;
  nextPageError: string | null = null;
  selectingPartyId: string | null = null;
  selectionError: string | null = null;
  connectorDetails: Record<string, IdpListItem> = {};
  loadingDetailsPartyIds = new Set<string>();
  detailErrorPartyIds = new Set<string>();

  readonly state$: Observable<IdpListState> = this._idpListService
    .get$(false, 1, this.pageSize)
    .pipe(
      tap((response) => {
        this.connectorPages.splice(
          0,
          this.connectorPages.length,
          response.items
        );
        this.currentPage = response.current_page;
        this.totalPages = response.total_pages;
        this.totalCount = response.total_count;
        this.loadConnectorDetails(response.items);
      }),
      map((response) => ({ status: 'loaded', response } as IdpListState)),
      startWith({ status: 'loading' } as IdpListState),
      catchError((error) =>
        of({
          status: 'error',
          message:
            error?.error?.detail ?? 'The connector list could not be loaded.',
        } as IdpListState)
      )
    );

  constructor(
    private _idpListService: IdpListService,
    private _route: ActivatedRoute,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  get hasMoreConnectors(): boolean {
    return (
      this.currentPage < this.totalPages &&
      this.connectorPages.reduce((total, page) => total + page.length, 0) <
        this.totalCount
    );
  }

  loadNextPage(): void {
    if (this.loadingNextPage || !this.hasMoreConnectors) return;
    const requestedPage = this.currentPage + 1;
    this.loadingNextPage = true;
    this.nextPageError = null;
    this._idpListService
      .get$(false, requestedPage, this.pageSize)
      .pipe(finalize(() => (this.loadingNextPage = false)))
      .subscribe({
        next: (response) => {
          this.connectorPages.push(response.items);
          this.currentPage = response.current_page;
          this.totalPages = response.total_pages;
          this.totalCount = response.total_count;
          this.loadConnectorDetails(response.items);
        },
        error: () => {
          this.nextPageError = 'The next connector page could not be loaded.';
        },
      });
  }

  get hasPendingNavigation(): boolean {
    return this._route.snapshot.queryParamMap.has('next');
  }

  getConnector(connector: IdpListItem): IdpListItem {
    return this.connectorDetails[connector.party_id] ?? connector;
  }

  isLoadingDetails(connector: IdpListItem): boolean {
    return this.loadingDetailsPartyIds.has(connector.party_id);
  }

  hasDetailError(connector: IdpListItem): boolean {
    return this.detailErrorPartyIds.has(connector.party_id);
  }

  areDetailsUnavailable(connector: IdpListItem): boolean {
    return this.isConnectorUnavailable(connector);
  }

  isConnectorUnavailable(connector: IdpListItem): boolean {
    const connectorDetails = this.getConnector(connector);
    return (
      !this.isLoadingDetails(connector) &&
      (this.hasDetailError(connector) ||
        Boolean(this.connectorDetails[connector.party_id])) &&
      !connectorDetails.dashboard_url
    );
  }

  getSortedConnectors(connectors: IdpListItem[]): IdpListItem[] {
    return connectors
      .map((connector, index) => ({ connector, index }))
      .sort((left, right) => {
        const leftUnavailable = this.isConnectorUnavailable(left.connector);
        const rightUnavailable = this.isConnectorUnavailable(right.connector);
        if (leftUnavailable === rightUnavailable) {
          return left.index - right.index;
        }
        return leftUnavailable ? 1 : -1;
      })
      .map(({ connector }) => connector);
  }

  selectConnector(connector: IdpListItem): void {
    if (
      this.selectingPartyId !== null ||
      this.isConnectorUnavailable(connector)
    ) {
      return;
    }

    this.selectionError = null;
    this.selectingPartyId = connector.party_id;
    const nextUrl = this._route.snapshot.queryParamMap.get('next');
    this._idpListService
      .select$(connector.party_id, nextUrl)
      .pipe(finalize(() => (this.selectingPartyId = null)))
      .subscribe({
        next: (response) => {
          this._document.location.href = response.redirect_url;
        },
        error: (error) => {
          this.selectionError =
            error?.error?.detail ??
            'The selected connector could not be saved.';
          this.selectingPartyId = null;
        },
      });
  }

  private loadConnectorDetails(connectors: IdpListItem[]): void {
    connectors.forEach((connector) => {
      if (
        this.connectorDetails[connector.party_id] ||
        this.loadingDetailsPartyIds.has(connector.party_id)
      ) {
        return;
      }

      this.loadingDetailsPartyIds.add(connector.party_id);
      this.detailErrorPartyIds.delete(connector.party_id);
      this._idpListService
        .details$(connector.party_id)
        .pipe(
          finalize(() => {
            this.loadingDetailsPartyIds.delete(connector.party_id);
          })
        )
        .subscribe({
          next: (details) => {
            this.connectorDetails[connector.party_id] = details;
          },
          error: () => {
            this.detailErrorPartyIds.add(connector.party_id);
          },
        });
    });
  }
}
