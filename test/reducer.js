import expect from 'expect.js';

import { ActionTypes, reducer } from '../es6/index';

describe('reducer', () => {
  it('returns empty state when passed undefined and non-uploader action', () => {
    expect(reducer(undefined, { type: 'INIT' })).to.eql({});
  });
  it('updates state on uploader actions', () => {
    const uploader = {};
    const newState = reducer(undefined, { type: ActionTypes.INITING, meta: { uploader } });
    expect(newState).to.be(uploader);
  });
  it('returns old state on non-uploader actions', () => {
    const uploader = {};
    const oldState = {};
    const newState = reducer(oldState, { type: 'FOO', meta: { uploader } });
    expect(newState).to.not.be(uploader);
    expect(newState).to.be(oldState);
  });
});
