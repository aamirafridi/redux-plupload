import expect from 'expect.js';

import { ActionTypes } from '../src/constants';

describe('constants', () => {
  describe('ActionTypes', () => {
    it('start with "redux-plupload/"', () => {
      expect(ActionTypes.INIT).to.be('redux-plupload/INIT');
      const keys = Object.keys(ActionTypes);
      expect(keys.length).to.not.be(0);
      let key = undefined;
      for (key of keys) {
        expect(ActionTypes[key]).to.match(/^redux-plupload\//);
      }
    });
  });
});
