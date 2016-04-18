import contentDisposition from 'content-disposition';

import { ActionTypes } from './constants';
import cloneMutable from './cloneMutable';

const actionToMethod = {
  [ActionTypes.SET_OPTION]: ['setOption', ({ option, value }) => [option, value]],
  [ActionTypes.REFRESH]: ['refresh'],
  [ActionTypes.START]: ['start'],
  [ActionTypes.STOP]: ['stop'],
  [ActionTypes.DISABLE_BROWSE]: ['disableBrowse', ({ disable }) => [disable]],
  [ActionTypes.ADD_FILE]: ['addFile', ({ file, fileName }) => [file, fileName]],
  [ActionTypes.REMOVE_FILE]: ['removeFile', ({ file }) => [file]],
  [ActionTypes.DESTROY]: ['destroy'],
  [ActionTypes.CLEAR]: ['splice'],
};

const actionToEvent = {
  [ActionTypes.INITING]: ['Init', () => ({})],
  [ActionTypes.POST_INIT]: ['PostInit', () => ({})],
  [ActionTypes.OPTION_CHANGED]: [
    'OptionChanged',
    (name, value, oldValue) => ({ payload: { name, value, oldValue } }),
  ],
  [ActionTypes.REFRESHING]: ['Refresh', () => ({})],
  [ActionTypes.STATE_CHANGED]: ['StateChanged', () => ({})],
  [ActionTypes.UPLOAD_FILE]: ['UploadFile', (file) => ({ payload: file })],
  [ActionTypes.BEFORE_UPLOAD]: ['BeforeUpload', (file) => ({ payload: file })],
  [ActionTypes.QUEUE_CHANGED]: ['QueueChanged', () => ({})],
  [ActionTypes.UPLOAD_PROGRESS]: ['UploadProgress', (file) => ({ payload: file })],
  [ActionTypes.FILES_REMOVED]: ['FilesRemoved', (files) => ({ payload: files })],
  [ActionTypes.FILE_FILTERED]: ['FileFiltered', (file) => ({ payload: file })],
  [ActionTypes.FILES_ADDED]: ['FilesAdded', (files) => ({ payload: files })],
  [ActionTypes.FILE_UPLOADED]: [
    'FileUploaded',
    (file, response) => ({ payload: file, meta: { response } }),
  ],
  [ActionTypes.CHUNK_UPLOADED]: [
    'ChunkUploaded',
    (file, response) => ({ payload: file, meta: { response } }),
  ],
  [ActionTypes.UPLOAD_COMPLETE]: ['UploadComplete', (files) => ({ payload: files })],
  [ActionTypes.ERROR]: ['Error', (error) => ({ payload: error, error: true })],
  [ActionTypes.DESTROYING]: ['Destroy', () => ({})],
};

const defaults = {
  runtimes: 'html5,html4',
  max_retries: 3,
  multipart: true,
  url: '/this/is/replaced/',
};

function setupUpload(origUploader, file, upload) {
  const uploader = origUploader;
  uploader.settings.multipart_params = upload.params || {};
  if (!uploader.settings.multipart_params['Content-Type']) {
    uploader.settings.multipart_params['Content-Type'] = file.type;
  }
  if (!uploader.settings.multipart_params['Content-Disposition']) {
    uploader.settings.multipart_params['Content-Disposition'] = contentDisposition(file.name);
  }
  if (uploader.settings.runtime === 'html4') {
    // TODO(geophree): better redirect url?
    const { protocol, host } = global.location;
    uploader.settings.multipart_params.redirect = `${protocol}//${host}/uploader/blank.html`;
  }
  uploader.setOption({});
}

function init(store, plupload, options) {
  const uploader = plupload.Uploader(options);  // eslint-disable-line new-cap
  let uploaderState = {};

  uploader.bind('BeforeUpload', (eventUploader, file) => {
    if (!options.uploadDataSelector) return;

    const upload = options.uploadDataSelector(store.getState(), file);
    setupUpload(eventUploader, file, upload);
  });

  Object.keys(actionToEvent).forEach(type => {
    const [event, argsToAction] = actionToEvent[type];
    uploader.bind(event, (nextUploaderState, ...args) => {
      uploaderState = cloneMutable(nextUploaderState, uploaderState);
      const action = argsToAction(...args);
      if (!action.meta) {
        action.meta = { uploader: uploaderState };
      } else {
        action.meta.uploader = uploaderState;
      }
      action.type = type;
      store.dispatch(action);
    });
  });

  uploader.init();
  return uploader;
}

export default function middleware(plupload, origOptions = {}) {
  let uploader;
  const options = { ...defaults, ...origOptions };
  return store => next => action => {
    const { type, payload = {} } = action;
    if (type === ActionTypes.INIT) {
      if (uploader) throw new Error('INIT called on existing uploader');
      uploader = init(store, plupload, options);
    }
    if (!uploader) return next(action);

    let method = undefined;
    let payloadTransform = undefined;
    switch (type) {
      case ActionTypes.REFRESH:
      case ActionTypes.START:
      case ActionTypes.STOP:
      case ActionTypes.CLEAR:
      case ActionTypes.DESTROY:
        [method] = actionToMethod[type];
        uploader[method]();
        break;
      case ActionTypes.SET_OPTION:
      case ActionTypes.DISABLE_BROWSE:
      case ActionTypes.ADD_FILE:
      case ActionTypes.REMOVE_FILE:
        [method, payloadTransform] = actionToMethod[type] || [];
        uploader[method](...(payloadTransform(payload) || []));
        break;
      default:
        break;
    }

    return next(action);
  };
}
