import React, { FC, useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';
import { isAfter } from 'date-fns';

/* Libraries */
import ReactPaginate from 'react-paginate';
import ReactModal from 'react-modal';
import { Formik, FormikActions, Form } from 'formik';

/* Components */
import { Loading } from '../components/Loading';
import FilterSelect from '../components/FilterSelect';
import FilterButton from '../components/FilterButton';
import FilterChip from '../components/FilterChip';

/* Helpers */
import {
  getQrCodes,
  PoapEvent,
  getEvents,
  qrCodesRangeAssign,
  qrCodesSelectionUpdate,
  QrCode,
  qrCodesListAssign,
  qrCreateMassive,
} from '../api';

// lib
import { reduceAddress } from '../lib/helpers';
import { etherscanLinks } from '../lib/constants';
import { authClient } from '../auth';

/* Assets */
import checked from '../images/checked.svg';
import error from '../images/error.svg';

/* Schemas */
import {
  UpdateModalWithFormikRangeSchema,
  UpdateModalWithFormikSelectedQrsSchema,
  UpdateModalWithFormikListSchema,
} from '../lib/schemas';

type PaginateAction = {
  selected: number;
};

// update modal types
type UpdateByRangeModalProps = {
  events: PoapEvent[];
  selectedQrs: string[];
  refreshQrs: () => void;
  onSuccessAction: () => void;
  handleUpdateModalClosing: () => void;
  passphrase: string;
};

type UpdateModalFormikValues = {
  from: number | string;
  to: number | string;
  event: number;
  hashesList: string;
  isUnassigning: boolean;
};

// authentication modal types
type AuthenticationModalProps = {
  setPassphrase: (passphrase: string) => void;
  passphraseError: boolean;
};

type AuthenticationModalFormikValues = {
  passphrase: string;
};

// creation modal types
type CreationModalProps = {
  handleCreationModalRequestClose: () => void;
  refreshQrs: () => void;
  events: PoapEvent[];
};

type CreationModalFormikValues = {
  ids: string;
  hashes: string;
  event: string;
};

const QrPage: FC = () => {
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [isFetchingQrCodes, setIsFetchingQrCodes] = useState<null | boolean>(null);
  const [qrCodes, setQrCodes] = useState<null | QrCode[]>(null);
  const [claimStatus, setClaimStatus] = useState<string>('');
  const [claimScanned, setClaimScanned] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<number | undefined>(undefined);
  const [events, setEvents] = useState<PoapEvent[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedQrs, setSelectedQrs] = useState<string[]>([]);
  const [initialFetch, setInitialFetch] = useState<boolean>(true);
  const [passphrase, setPassphrase] = useState<string>('');
  const [passphraseError, setPassphraseError] = useState<boolean>(false);
  const [isAuthenticationModalOpen, setIsAuthenticationModalOpen] = useState<boolean>(true);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState<boolean>(false);

  const { addToast } = useToasts();

  const isAdmin = authClient.isAuthenticated();

  useEffect(() => {
    fetchEvents();
    setInitialFetch(false);

    if (isAdmin) {
      setIsAuthenticationModalOpen(false);
      fetchQrCodes();
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (passphrase) fetchQrCodes();
  }, [passphrase]);

  useEffect(() => {
    if (!initialFetch) {
      fetchQrCodes()
    }
  }, [page]);

  useEffect(() => {
    if (!initialFetch) {
      cleanQrSelection();
      setPage(0);
      fetchQrCodes();
    }
  }, [
    selectedEvent,
    claimStatus,
    claimScanned,
    limit
  ]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const cleanQrSelection = () => setSelectedQrs([]);

  const fetchEvents = async () => {
    const events = await getEvents();

    if (isAdmin) {
      setEvents(events);
    } else {
      const eventsForCommunity = events.filter(event => !event.from_admin);

      setEvents(eventsForCommunity);
    }
  };

  const fetchQrCodes = async () => {
    setIsFetchingQrCodes(true);

    let event_id = undefined;
    if (selectedEvent !== undefined) event_id = selectedEvent > -1 ? selectedEvent : undefined;

    let _status = undefined;
    let _scanned = undefined;

    if (claimStatus) _status = claimStatus === 'claimed';
    if (claimScanned) _scanned = claimScanned === 'true';

    try {
      const response = await getQrCodes(
        limit,
        page * limit,
        passphrase,
        _status,
        _scanned,
        event_id
      );
      setQrCodes(response.qr_claims);
      setTotal(response.total);
      setIsAuthenticationModalOpen(false);
    } catch (e) {
      addToast(e.message, {
        appearance: 'error',
        autoDismiss: false,
      });
      setPassphraseError(true);
    } finally {
      setIsFetchingQrCodes(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    const numericValue = Number(value);
    setSelectedEvent(numericValue);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    setClaimStatus(value);
  };

  const handleScannedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { value } = e.target;
    setClaimScanned(value);
  };

  const handlePageChange = (obj: PaginateAction) => {
    console.log(obj);
    setPage(obj.selected);
  };

  const handleQrCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id } = e.target;
    const stringifiedId = String(id);

    return selectedQrs.includes(stringifiedId)
      ? setSelectedQrs(selectedQrs => selectedQrs.filter((qrId: string) => qrId !== stringifiedId))
      : setSelectedQrs(selectedQrs => [...selectedQrs, stringifiedId]);
  };

  const handleLimitChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { value } = e.target;
    setLimit(parseInt(value, 10));
  }

  const handleUpdateModalClick = (): void => setIsUpdateModalOpen(true);

  const handleCreationModalClick = (): void => setIsCreationModalOpen(true);

  const handleUpdateModalRequestClose = (): void => setIsUpdateModalOpen(false);

  const handleCreationModalRequestClose = (): void => setIsCreationModalOpen(false);

  return (
    <div className={'admin-table qr'}>
      <h2>QR Codes</h2>
      <div className={'filters-container qr'}>
        <div className={'filter col-md-4'}>
          <div className="filter-option">
            <FilterSelect handleChange={handleSelectChange}>
              <option key={'initialValue'} value={-1}>
                Filter by event
              </option>
              {events &&
                events.map(event => {
                  const label = `${event.name ? event.name : 'No name'} (${event.fancy_id}) - ${
                    event.year
                  }`;

                  return (
                    <option key={event.id} value={event.id}>
                      {label}
                    </option>
                  );
                })}
            </FilterSelect>
          </div>
        </div>
        <div className={'filter col-md-3'}>
          <div className={'filter-group'}>
            <FilterSelect handleChange={handleStatusChange}>
              <option value="">Filter by status</option>
              <option value="claimed">Claimed</option>
              <option value="unclaimed">Unclaimed</option>
            </FilterSelect>
          </div>
        </div>
        <div className={'filter col-md-3'}>
          <div className={'filter-group'}>
            <FilterSelect handleChange={handleScannedChange}>
              <option value="">Filter by scanned</option>
              <option value="true">Scanned</option>
              <option value="false">Not scanned</option>
            </FilterSelect>
          </div>
        </div>
        <div className={`action-button-container col-md-${isAdmin ? 2 : 5}`}>
          <FilterButton text="Update" handleClick={handleUpdateModalClick} />
        </div>
        {isAdmin && (
          <div className={'action-button-container col-md-2'}>
            <FilterButton text="Create" handleClick={handleCreationModalClick} />
          </div>
        )}
        <ReactModal
          isOpen={isUpdateModalOpen}
          onRequestClose={handleUpdateModalRequestClose}
          shouldFocusAfterRender={true}
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
        >
          <UpdateModal
            handleUpdateModalClosing={handleUpdateModalRequestClose}
            selectedQrs={selectedQrs}
            refreshQrs={fetchQrCodes}
            onSuccessAction={cleanQrSelection}
            passphrase={passphrase}
            events={events}
          />
        </ReactModal>
        <ReactModal
          isOpen={isAuthenticationModalOpen}
          shouldFocusAfterRender={true}
          shouldCloseOnEsc={false}
          shouldCloseOnOverlayClick={false}
        >
          <AuthenticationModal setPassphrase={setPassphrase} passphraseError={passphraseError} />
        </ReactModal>
        <ReactModal
          isOpen={isCreationModalOpen}
          onRequestClose={handleCreationModalRequestClose}
          shouldFocusAfterRender={true}
          shouldCloseOnEsc={true}
          shouldCloseOnOverlayClick={true}
        >
          <CreationModal
            events={events}
            refreshQrs={fetchQrCodes}
            handleCreationModalRequestClose={handleCreationModalRequestClose}
          />
        </ReactModal>
      </div>
      <div className={'secondary-filters'}>
        Results per page:
        <select onChange={handleLimitChange}>
          <option value={10}>10</option>
          <option value={100}>100</option>
          <option value={1000}>1000</option>
        </select>
      </div>

      {isFetchingQrCodes && <Loading />}

      {qrCodes && qrCodes.length !== 0 && !isFetchingQrCodes && (
        <div className={'qr-table-section'}>
          <div className={'row table-header visible-md'}>
            <div className={'col-md-1 center'}>-</div>
            <div className={'col-md-2'}>QR Hash</div>
            <div className={'col-md-4'}>Event</div>
            <div className={'col-md-1 center'}>Status</div>
            <div className={'col-md-1 center'}>Scanned</div>
            <div className={'col-md-3 center'}>Tx Hash</div>
          </div>
          <div className={'admin-table-row qr-table'}>
            {qrCodes.map((qr, i) => {
              return (
                <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={qr.id}>
                  <div className={'col-md-1 center checkbox'}>
                    {!qr.claimed && (
                      <input
                        type="checkbox"
                        disabled={qr.claimed}
                        onChange={handleQrCheckboxChange}
                        checked={selectedQrs.includes(String(qr.id))}
                        id={String(qr.id)}
                      />
                    )}
                  </div>

                  <div className={'col-md-2'}>
                    <span className={'visible-sm'}>QR Hash: </span>
                    {qr.qr_hash}
                  </div>

                  <div className={'col-md-4 elipsis'}>
                    <span className={'visible-sm'}>Event: </span>
                    {(!qr.event || !qr.event.name) && <span>-</span>}

                    {qr.event && qr.event.event_url && qr.event.name && (
                      <a href={qr.event.event_url} target="_blank" rel="noopener noreferrer">
                        {qr.event.name}
                      </a>
                    )}

                    {qr.event && qr.event.name && !qr.event.event_url && (
                      <span>{qr.event.name}</span>
                    )}
                  </div>

                  <div className={'col-md-1 center status'}>
                    <span className={'visible-sm'}>Status: </span>
                    <img
                      src={qr.claimed ? checked : error}
                      alt={qr.event && qr.event.name ? `${qr.event.name} status` : 'qr status'}
                      className={'status-icon'}
                    />
                  </div>

                  <div className={'col-md-1 center'}>
                    <span className={'visible-sm'}>Scanned: </span>
                    <img
                      src={qr.scanned ? checked : error}
                      alt={qr.scanned ? `QR Scanned` : 'QR not scanned'}
                      className={'status-icon'}
                    />
                  </div>

                  <div className={'col-md-3 center'}>
                    <span className={'visible-sm'}>Tx Hash: </span>
                    <a href={etherscanLinks.tx(qr.tx_hash)} target={'_blank'}>
                      {qr.tx_hash && reduceAddress(qr.tx_hash)}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          {total > 10 && (
            <div className={'pagination'}>
              <ReactPaginate
                pageCount={Math.ceil(total / limit)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                activeClassName={'active'}
                onPageChange={handlePageChange}
                forcePage={page}
              />
            </div>
          )}
        </div>
      )}

      {qrCodes && qrCodes.length === 0 && !isFetchingQrCodes && (
        <div className={'no-results'}>No QR codes found</div>
      )}
    </div>
  );
};

const CreationModal: React.FC<CreationModalProps> = ({
  handleCreationModalRequestClose,
  refreshQrs,
  events,
}) => {
  const [incorrectQrHashes, setIncorrectQrHashes] = useState<string[]>([]);
  const [incorrectQrIds, setIncorrectQrIds] = useState<string[]>([]);
  const [qrIds, setQrsIds] = useState<string[]>([]);
  const [qrHashes, setQrsHashes] = useState<string[]>([]);

  const { addToast } = useToasts();

  const hasSameQrsQuantity =
    qrHashes.length === qrIds.length && qrHashes.length > 0 && qrIds.length > 0;
  const hasNoIncorrectQrs =
    incorrectQrHashes.length === 0 &&
    incorrectQrIds.length === 0 &&
    (qrIds.length > 0 || qrHashes.length > 0);
  const hasHashesButNoIds = qrHashes.length > 0 && qrIds.length === 0;

  const shouldShowMatchErrorMessage =
    (!hasSameQrsQuantity || !hasHashesButNoIds) && hasNoIncorrectQrs;

  const handleCreationModalSubmit = (values: CreationModalFormikValues) => {
    const { hashes, ids, event } = values;

    const hashRegex = /^[a-zA-Z0-9]{6}$/;
    const idRegex = /^[0-9]+$/;

    const _incorrectQrHashes: string[] = [];
    const _incorrectQrIds: string[] = [];

    const qrHashesFormatted = hashes
      .trim()
      .split('\n')
      .map(hash => hash.trim())
      .filter(hash => {
        if (!hash.match(hashRegex) && hash !== '') _incorrectQrHashes.push(hash);

        return hash.match(hashRegex);
      });

    const qrIdsFormatted = ids
      .trim()
      .split('\n')
      .map(id => id.trim())
      .filter(id => {
        if (!id.match(idRegex) && id !== '') _incorrectQrIds.push(id);

        return id.match(idRegex);
      });

    const _hasSameQrsQuantity =
      qrHashesFormatted.length === qrIdsFormatted.length &&
      qrHashesFormatted.length > 0 &&
      qrIdsFormatted.length > 0;
    const _hasNoIncorrectQrs = _incorrectQrHashes.length === 0 && _incorrectQrIds.length === 0;
    const _hasHashesButNoIds = qrHashesFormatted.length > 0 && qrIdsFormatted.length === 0;

    setIncorrectQrHashes(_incorrectQrHashes);
    setIncorrectQrIds(_incorrectQrIds);

    if (!_incorrectQrHashes && !_incorrectQrIds) {
      setQrsHashes(qrHashesFormatted);
      setQrsIds(qrIdsFormatted);
    }

    if (_hasNoIncorrectQrs) {
      if (_hasHashesButNoIds || _hasSameQrsQuantity) {
        qrCreateMassive(qrHashesFormatted, qrIdsFormatted, event)
          .then(_ => {
            addToast('QR codes updated correctly', {
              appearance: 'success',
              autoDismiss: true,
            });
            refreshQrs();
            handleCreationModalClosing();
          })
          .catch(e => {
            console.log(e);
            addToast(e.message, {
              appearance: 'error',
              autoDismiss: false,
            });
          });
      }
    }
  };

  const handleCreationModalClosing = () => handleCreationModalRequestClose();

  return (
    <Formik
      initialValues={{
        hashes: '',
        ids: '',
        event: '',
      }}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={handleCreationModalSubmit}
    >
      {({ values, handleChange, handleSubmit }) => {
        const isEventPlaceholder = !Boolean(values.event);

        return (
          <div className={'update-modal-container'}>
            <div className={'modal-top-bar'}>
              <h3>QR Create</h3>
            </div>
            <div className="creation-modal-content">
              <div>
                <textarea
                  className="modal-textarea"
                  name="hashes"
                  value={values.hashes}
                  onChange={handleChange}
                  placeholder="QRs hashes list"
                />
                {incorrectQrHashes.length > 0 && (
                  <span>
                    The following hashes are not valid, please fix them or remove them to submit
                    again: {`${incorrectQrHashes.join(', ')}`}
                  </span>
                )}
              </div>

              <div>
                <textarea
                  className="modal-textarea"
                  value={values.ids}
                  name="ids"
                  onChange={handleChange}
                  placeholder="QRs IDs list"
                />
                {incorrectQrIds.length > 0 && (
                  <span>
                    The following IDs are not valid, please fix them or remove them to submit again:{' '}
                    {`${incorrectQrIds.join(', ')}`}
                  </span>
                )}
              </div>
            </div>
            <div className="select-container">
              <select
                value={values.event}
                onChange={handleChange}
                name="event"
                className={`select ${isEventPlaceholder ? 'placeholder-option' : ''}`}
              >
                <option value="">Select an event</option>
                {events &&
                  events.map((event: PoapEvent) => {
                    const label = `${event.name ? event.name : 'No name'} (${event.fancy_id}) - ${
                      event.year
                    }`;
                    return (
                      <option key={event.id} value={event.id}>
                        {label}
                      </option>
                    );
                  })}
              </select>
              {shouldShowMatchErrorMessage && (
                <span>Quantity of IDs and hashes must match or send hashes with none IDs</span>
              )}
            </div>
            <div className="modal-content">
              <div className="modal-buttons-container creation-modal">
                <div className="modal-action-buttons-container">
                  <FilterButton text="Cancel" handleClick={handleCreationModalClosing} />
                  <FilterButton text="Create" handleClick={handleSubmit} />
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};

const AuthenticationModal: React.FC<AuthenticationModalProps> = ({
  setPassphrase,
  passphraseError,
}) => {
  const handleAuthenticationModalSubmit = (values: AuthenticationModalFormikValues, props: any) => {
    setPassphrase(values.passphrase);
    props.resetForm();
  };

  return (
    <Formik
      initialValues={{
        passphrase: '',
      }}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={handleAuthenticationModalSubmit}
    >
      {({ values, handleChange }) => {
        return (
          <Form className="authentication_modal_container">
            <input
              className={passphraseError ? 'modal-input-error' : ''}
              placeholder={
                passphraseError ? 'The passphrase you entered is incorrect' : 'Passphrase'
              }
              name="passphrase"
              value={values.passphrase}
              onChange={handleChange}
            />
            <button className="filter-base filter-button" type="submit">
              Submit passphrase
            </button>
          </Form>
        );
      }}
    </Formik>
  );
};

const UpdateModal: React.FC<UpdateByRangeModalProps> = ({
  events,
  selectedQrs,
  refreshQrs,
  onSuccessAction,
  handleUpdateModalClosing,
  passphrase,
}) => {
  const [isSelectionActive, setIsSelectionActive] = useState<boolean>(false);
  const [isRangeActive, setIsRangeActive] = useState<boolean>(false);
  const [isListActive, setIsListActive] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<number | null | 'unassign'>(null);
  const [incorrectQrHashes, setIncorrectQrHashes] = useState<string[]>([]);
  const [isSendingHashList, setIsSendingHashList] = useState<boolean>(false);
  const [qrHashList, setQrHashList] = useState<string[]>([]);
  const { addToast } = useToasts();

  const isAdmin = authClient.isAuthenticated();

  const hasSelectedQrs = selectedQrs.length > 0;
  const hasIncorrectHashes = incorrectQrHashes.length > 0;

  useEffect(() => {
    hasSelectedQrs ? setIsSelectionActive(true) : setIsRangeActive(true);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (isSendingHashList && !hasIncorrectHashes) {
      assignHashList();
    }
    setIsSendingHashList(false);
  }, [hasIncorrectHashes, isSendingHashList, selectedEvent]);

  useEffect(() => {
    if (isListActive) setIsSendingHashList(true);
  }, [selectedEvent]);

  const assignHashList = () => {
    if (isListActive) {
      if (!hasIncorrectHashes) {
        const event = selectedEvent === 'unassign' ? null : selectedEvent;
        qrCodesListAssign(qrHashList, event)
          .then(res => {
            const hasAlreadyClaimedHashes = res.alreadyclaimedQrs.length > 0;

            if (hasAlreadyClaimedHashes) {
              addToast(
                `QR hashes list updated correctly but the following list had already been claimed: ${res.alreadyclaimedQrs.join(
                  ', '
                )}`,
                {
                  appearance: 'warning',
                  autoDismiss: false,
                }
              );
            } else {
              addToast('QR hashes list updated correctly', {
                appearance: 'success',
                autoDismiss: true,
              });
            }

            onSuccessAction();
            refreshQrs();
            handleUpdateModalClosing();
          })
          .catch(e =>
            addToast(e.message, {
              appearance: 'error',
              autoDismiss: false,
            })
          );
      }
    }
  };

  const handleUpdateModalSubmit = (
    values: UpdateModalFormikValues,
    actions: FormikActions<UpdateModalFormikValues>
  ) => {
    const { from, to, event, hashesList, isUnassigning } = values;

    if (!isUnassigning && !event) {
      actions.setErrors({ event: 'Required' });
      return false;
    }

    const _event = isUnassigning ? null : event;

    const hashRegex = /^[a-zA-Z0-9]{6}$/;
    setIncorrectQrHashes([]);

    const _incorrectQrHashes: string[] = [];

    const _hashesList = hashesList
      .trim()
      .split('\n')
      .map(hash => hash.trim())
      .filter(hash => {
        if (!hash.match(hashRegex)) _incorrectQrHashes.push(hash);

        return hash.match(hashRegex);
      });

    setIncorrectQrHashes(_incorrectQrHashes);
    setQrHashList(_hashesList);

    if (isRangeActive) {
      if (typeof from === 'number' && typeof to === 'number') {
        qrCodesRangeAssign(from, to, _event, passphrase)
          .then(_ => {
            addToast('QR codes updated correctly', {
              appearance: 'success',
              autoDismiss: true,
            });
            onSuccessAction();
            refreshQrs();
            handleUpdateModalClosing();
          })
          .catch(e =>
            addToast(e.message, {
              appearance: 'error',
              autoDismiss: false,
            })
          );
      }
    }

    if (isSelectionActive) {
      qrCodesSelectionUpdate(selectedQrs, _event, passphrase)
        .then(_ => {
          addToast('QR codes updated correctly', {
            appearance: 'success',
            autoDismiss: true,
          });
          onSuccessAction();
          refreshQrs();
          handleUpdateModalClosing();
        })
        .catch(e => {
          console.log(e);
          addToast(e.message, {
            appearance: 'error',
            autoDismiss: false,
          });
        });
    }

    if (isListActive) {
      const event = _event === null ? 'unassign' : _event;
      // setIsSendingHashList(true);
      setSelectedEvent(event);
    }
  };

  const handleChipClick = (event: React.ChangeEvent, setFieldValue: Function, values: any) => {
    setFieldValue('isUnassigning', !values.isUnassigning);
  };

  const handleSelectionChange = () => {
    if (!hasSelectedQrs) return;
    setIsRangeActive(false);
    setIsListActive(false);
    setIsSelectionActive(true);
  };

  const handleRangeChange = () => {
    setIsSelectionActive(false);
    setIsListActive(false);
    setIsRangeActive(true);
  };

  const handleListChange = () => {
    setIsRangeActive(false);
    setIsSelectionActive(false);
    setIsListActive(true);
  };

  return (
    <Formik
      initialValues={{
        from: 0,
        to: 0,
        event: 0,
        hashesList: '',
        isUnassigning: false,
      }}
      validationSchema={
        (isSelectionActive && UpdateModalWithFormikSelectedQrsSchema) ||
        (isRangeActive && UpdateModalWithFormikRangeSchema) ||
        (isListActive && UpdateModalWithFormikListSchema)
      }
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={handleUpdateModalSubmit}
    >
      {({ values, errors, handleChange, handleSubmit, setFieldValue }) => {
        const { isUnassigning } = values;
        const isPlaceholderValue = Boolean(values.event);

        const resolveSelectClass = () => {
          if (isUnassigning) return '';
          if (errors.event && !Boolean(values.event)) return 'modal-select-error';
          if (!isPlaceholderValue) return 'placeholder-option';
          return '';
        };

        const resolveSelectText = () => {
          if (values.isUnassigning) return 'You are unassigning the QRs';
          if (errors.event && !Boolean(values.event)) return 'The selection is required';
          return 'Select an event';
        };

        const handleFormSubmitClick = () => {
          handleSubmit();
        };

        return (
          <div className={'update-modal-container'}>
            <div className={'modal-top-bar'}>
              <h3>QR Update</h3>
            </div>
            <div className="modal-content">
              <div className="option-container">
                <div className="radio-container">
                  <input
                    type="radio"
                    checked={isSelectionActive}
                    onChange={handleSelectionChange}
                  />
                </div>
                <div className="label-container">
                  <span>Selection</span>
                </div>
                <div className="content-container">
                  {hasSelectedQrs ? (
                    <span>{`You have ${selectedQrs.length} QR's selected`}</span>
                  ) : (
                    <span className="grey-text">You have no selected QRs</span>
                  )}
                </div>
              </div>
              <div className="option-container">
                <div className="radio-container">
                  <input type="radio" checked={isRangeActive} onChange={handleRangeChange} />
                </div>
                <div className="label-container">
                  <span>Range</span>
                </div>
                <div className="content-container">
                  <input
                    className={errors.from && !Boolean(values.from) ? 'modal-input-error' : ''}
                    type="number"
                    placeholder={
                      errors.from && !Boolean(values.from)
                        ? 'This field should be a positive number'
                        : 'From'
                    }
                    name="from"
                    onChange={handleChange}
                    disabled={!isRangeActive}
                  />
                  <input
                    className={errors.to && !Boolean(values.to) ? 'modal-input-error' : ''}
                    type="number"
                    placeholder={
                      errors.to && !Boolean(values.to)
                        ? 'This field should be a positive number'
                        : 'To'
                    }
                    name="to"
                    onChange={handleChange}
                    disabled={!isRangeActive}
                  />
                </div>
              </div>
              {isAdmin && (
                <div className="option-container">
                  <div className="radio-container">
                    <input type="radio" checked={isListActive} onChange={handleListChange} />
                  </div>
                  <div className="label-container">
                    <span>List</span>
                  </div>
                  <div className="content-container list-container">
                    <textarea
                      name="hashesList"
                      onChange={handleChange}
                      disabled={!isListActive}
                      placeholder="List of QRs"
                      className="modal-textarea"
                    />
                    {isListActive && hasIncorrectHashes && (
                      <span>
                        The following codes are not valid, please fix them or remove them to submit
                        again: {`${incorrectQrHashes.join(', ')}`}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <select
                className={resolveSelectClass()}
                disabled={values.isUnassigning}
                name="event"
                onChange={handleChange}
              >
                <option value="">{resolveSelectText()}</option>
                {events &&
                  events
                    .filter(event => {
                      if (!isAdmin) {
                        const todayDate = new Date();
                        const eventDate = new Date(event.start_date);
                        return isAfter(eventDate, todayDate);
                      }

                      return event;
                    })
                    .map(event => {
                      const label = `${event.name ? event.name : 'No name'} (${event.fancy_id}) - ${
                        event.year
                      }`;
                      return (
                        <option key={event.id} value={event.id}>
                          {label}
                        </option>
                      );
                    })}
              </select>
              <div className="modal-buttons-container">
                <FilterChip
                  name="isUnassigning"
                  text="Unassign QRs"
                  isActive={values.isUnassigning}
                  handleOnClick={(e: React.ChangeEvent) =>
                    handleChipClick(e, setFieldValue, values)
                  }
                />
                <div className="modal-action-buttons-container">
                  <FilterButton text="Cancel" handleClick={handleUpdateModalClosing} />
                  <FilterButton text="Confirm update" handleClick={handleFormSubmitClick} />
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};

export { QrPage };
