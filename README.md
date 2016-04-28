# Redux-plupload
[FSA](https://github.com/acdlite/flux-standard-action)-compliant Redux bindings for [Plupload](https://github.com/moxiecode/plupload).
## Usage
To use `redux-plupload`, you must install the middleware (optionally the reducer), then send an `ActionTypes.INIT` message to init the `plupload.Uploader`.  The `payload` of the action should include a `browse_button` (and optionaly `dropzone`) prop.  You can also specify `url` and `multipart_params` props at `INIT` time, or provide an `uploadSettingsSelector` that will be called with `state` and `file` as args to find the extra per-file upload settings.
```js
// client.js
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { reducer as uploaderReducer, createMiddleware as createUploaderMiddleware } from 'redux-plupload';

import UploadButton from './UploadButton';

const reducer = combineReducers({ uploader: uploaderReducer });
const uploadSettingsSelector = (state, file) => sate.path.to.server.upload.settings.for[file.id];
const uploaderMiddleware = createUploaderMiddleware(global.plupload, { uploadSettingsSelector });
const store = createStore(
  reducer,
  {},
  applyMiddleware(uploaderMiddleware)
);

ReactDOM.render(
  <Provider store={store}>
    <UploadButton />
  </Provider>,
  global.document.getElementById('js-app')
);

```
```js
// UploadButton.js
import { connect } from 'redux';
import { ActionTypes } from 'redux-plupload';

const uploaderInit(payload) => ({ type: ActionTypes.INIT, payload });

class UploadButton extends Component {
  componentDidMount() {
    this.props.initUploader({ browse_button: this._browseButton });
  }

  render() {
    return (
      <button
        type="button"
        ref={(browseButton) => (this._browseButton = browseButton)}
      >Upload Files</button>
    );
  }
}

export default connect(
  () => ({}),
  (dispatch) => ({ initUploader: (payload) => dispatch(uploaderInit(payload)) })
)(UploadButton);
```
Once you've `INIT`ed `redux-plupload`, it will call the `plupload.Uploader`'s methods in response to actions, and emit actions based on the events that the `plupload.Uploader` emits (with a few name-changes where they clash).  If you install the reducer, it will keep its state up to date with a copy of the `plupload.Uploader` state.
