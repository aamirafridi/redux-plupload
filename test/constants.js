import expect from 'expect.js';

import { ActionTypes } from '../src/constants';

describe('constants', () => {
  describe('ActionTypes', () => {
    it('start with "UPLOADER_"', () => {
      expect(ActionTypes.INIT).to.be('UPLOADER_INIT');
      const keys = Object.keys(ActionTypes);
      expect(keys.length).to.not.be(0);
      let key = undefined;
      for (key of keys) {
        expect(ActionTypes[key]).to.match(/^UPLOADER_/);
      }
    });
  });
});
