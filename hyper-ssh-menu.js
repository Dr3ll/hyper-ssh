'use strict';
const { shell, app } = require('electron');
const SSHUI = require('./lib/ui');
const [loadConfig, saveConfig] = require('./lib/loadConfig');

const MOD_KEY = 'CommandOrControl+Shift'; //process.platform === 'darwin' ? 'Cmd' : 'Ctrl';

const sshMenuConfig = loadConfig();
let eventDispatch = {};
let storeHandle;

function newSession() {
  /*storeHandle.dispatch({
    type: 'SESSION_ADD'
    });*/
}

exports.decorateMenu = menu => menu.map(item => {
  if (item.label !== 'Plugins') return item;
  const newItem = Object.assign({}, item);
  newItem.submenu = newItem.submenu.concat({
    label: 'Quick SSH',
    type: 'submenu',
    submenu: [{
      label: 'Show/Hide List',
      accelerator: "".concat(MOD_KEY, "+O"),
      click: (clickedItem, focusedWindow) => {
        if (focusedWindow !== null) {
          focusedWindow.rpc.emit('hyper-ssh-menu_openList', {
            focusedWindow
          });
        }
      }
    }]
  });
  return newItem;
});

exports.decorateConfig = (config) => {

  const primaryColor = 'rgba(255, 155, 155, .5)';

  return Object.assign({}, config,
    {
      css: `
      .hyper-ssh-menu-base {
          color: ${config.foregroundColor};
          position: absolute;
          padding: 5px;
          top: 34px;
          font-size: 13.3333333px;
          bottom: 0;
          right: 0;
          width: 300px;
          background: rgba(255, 255, 255, .04);
          font-family: ${config.fontFamily};
      }
      .hyper-ssh-menu-form label {
          width: 108px;
          display: inline-block;
      }
      .hyper-ssh-menu-form input {
          width: 180px;
          display: inline-block;
          padding: 2px 5px;
          color: ${config.foregroundColor};
          background: rgba(255,255,255,.1);
          border: 1px solid ${primaryColor};
      }
      .hyper-ssh-menu-setup {
          padding: 5px;
          height: 40px;
          background: ${primaryColor};
          border: 0;
          color: ${config.foregroundColor};
      }
      .hyper-ssh-menu-add-button {
          height: 25px;
          width: 25px;
          padding: 5px;
          background: ${primaryColor};
          border: 0;
          color: ${config.foregroundColor};
      }
      .hyper-ssh-menu-button {
          height: 25px;
          padding: 5px;
          background: ${primaryColor};
          border: 0;
          color: ${config.foregroundColor};
      }
  `}
  );
};

exports.decorateHyper = (Hyper, _ref) => {
  let {
    React
  } = _ref;
  return class extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      return React.createElement(Hyper, Object.assign({}, this.props, {
        customChildren: SSHUI(React, eventDispatch, sshMenuConfig, saveConfig)
      }));
    }

  };
};

function waitFor(object, key, fn) {
  if (key in object) {
    fn(object[key]);
  } else {
    setTimeout(() => waitFor(object, key, fn), 10);
  }
}

exports.onWindow = win => {
  win.rpc.on('hyper-ssh_execute-commands', (_ref2) => {
    let [uid, commands] = _ref2;
    commands.forEach(cmd => {
      win.sessions.get(uid).write(cmd + '\r');
    });
  });
};

exports.onRendererWindow = win => {
  waitFor(win, 'rpc', rpc => {
    rpc.on('session add', details => {
      const {
        uid
      } = details;
      eventDispatch['rpc'] = rpc;
      eventDispatch['uid'] = uid;
    });
  });
};

exports.middleware = (store) => (next) => (action) => {

  storeHandle = store;
  const uids = store.getState().sessions.sessions;
  switch (action.type) {
    case 'SESSION_USER_DATA':

      break;
    case 'SESSION_ADD':
      //window.HYPER_HISTORY_TERM = currTerminal = allTerminals[action.uid];
      break;
    case 'SESSION_SET_ACTIVE':
      //currPid = uids[action.uid].pid;
      //window.HYPER_HISTORY_TERM = currTerminal = allTerminals[action.uid];
      //setCwd(currPid);
      break;
  }
  next(action);
};
