'use strict';
const { shell, app } = require('electron');
const SSHUI = require('./lib/ui');
const [loadConfig, saveConfig] = require('./lib/loadConfig');

const MOD_KEY = 'CommandOrControl+Shift'; //process.platform === 'darwin' ? 'Cmd' : 'Ctrl';

const sshMenuConfig = loadConfig();

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
          focusedWindow.rpc.emit('hyper-quickssh:open:window', {
            focusedWindow
          });
        }
      }
    }, {
      label: 'Open Config',
      click: (clickedItem, focusedWindow) => {
        if (focusedWindow !== null) {
          focusedWindow.rpc.emit('hyper-quickssh:open:config', {
            focusedWindow
          });
        }
      }
    }]
  });
  return newItem;
});

let eventDispatch = {};

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
