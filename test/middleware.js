import { EventEmitter } from 'events';
import expect from 'expect.js';
import sinonLib from 'sinon';

import { middleware, ActionTypes } from '../src/index';

// const noop = () => {};
// const noopStore = {
//   getState: noop,
//   dispatch: noop,
//   foo: true,
// };
//
// function createNoopStore() {
//   return noopStore;
// }

class UploaderClass extends EventEmitter {
  bind(...args) {
    this.on(...args);
  }

  init() {}
  setOption() {}
}

function Uploader() {
  return new UploaderClass();
}

const plupload = { Uploader };

describe('middleware', () => {
  let sinon;
  let uploader;

  beforeEach(() => {
    sinon = sinonLib.sandbox.create();
    uploader = new Uploader();
  });

  afterEach(() => {
    sinon.verifyAndRestore();
  });

  it('returns a function', () => {
    const mw = middleware();
    expect(mw).to.be.a('function');
  });

  it('creates an uploader on INIT', () => {
    const pluploadMock = sinon.mock(plupload);
    pluploadMock.expects('Uploader').once().returns(uploader);
    const mw = middleware(plupload);
    mw({})(() => {})({ type: ActionTypes.INIT });
  });

  it('inits and binds to events on INIT', () => {
    sinon.stub(plupload, 'Uploader').returns(uploader);
    const uploaderMock = sinon.mock(uploader);
    uploaderMock.expects('init').once();
    uploaderMock.expects('bind').atLeast(1);
    const mw = middleware(plupload);
    mw({})(() => {})({ type: ActionTypes.INIT });
  });

  it('proxies actions to uploader methods', () => {
    sinon.stub(plupload, 'Uploader').returns(uploader);
    sinon.mock(uploader).expects('setOption').once().withExactArgs('option1', 'value1');
    const dispatch = middleware(plupload)({})(() => {});
    dispatch({ type: ActionTypes.INIT });
    dispatch({ type: ActionTypes.SET_OPTION, payload: { option: 'option1', value: 'value1' } });
  });

  it('proxies uploader events to actions', () => {
    sinon.stub(plupload, 'Uploader').returns(uploader);
    const store = { dispatch() {} };
    const storeMock = sinon.mock(store);
    const file = { id: 'fileid1' };
    const action = {
      type: ActionTypes.UPLOAD_FILE,
      payload: file,
      meta: { uploader: { domain: null } },
    };
    storeMock.expects('dispatch').once().withExactArgs(action);
    const dispatch = middleware(plupload)(store)(() => {});
    dispatch({ type: ActionTypes.INIT });
    uploader.emit('UploadFile', uploader, file);
  });
});
