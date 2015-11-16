import React from 'react';
import { compose, createStore } from 'redux';

import { devTools, persistState } from 'redux-devtools';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';


let finalCreateStore = createStore;
if (__DEBUG__) {
finalCreateStore = compose(
    devTools(),
    persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
)(createStore);
}

let renderDevTools = function (store) {
  if (__DEBUG__) {
    return (
      <DebugPanel top right bottom>
        <DevTools store={store} monitor={LogMonitor} />
      </DebugPanel>
    );
  }
  return null;
}


export {finalCreateStore as finalCreateStore}
export {renderDevTools as renderDevTools}
