'use strict';

/*const { shell, app } = require('electron');
let { exec } = require('child_process');
const color = require('color');
const fs = require('fs');
const path = require('path');
const fuzzy = require('fuzzy');

const DEBUG = process.env.NODE_ENV === 'development' || process.env.DEBUG || false;
const isMac = process.platform === 'darwin';

let log = require('electron-log');

const CHAR_CODE_1 = 161;
const CHAR_CODE_2 = 8482;
const CHAR_CODE_3 = 163;
const QUICK_SELECT_CHAR_CODE = [CHAR_CODE_1, CHAR_CODE_2, CHAR_CODE_3];

// default icons and colors
const QUICKSSH_ICONS  = [ "default", "bug", "cpu", "cycle", "data", "image", "king", "load", "mail", "net", "rain", "spring" ];
const QUICKSSH_COLORS = [ "#50E3C2", "#B8E986", "#4A90E2", "#FF864C", "#D764EF", "#7ED321", "#54D3FF", "#54D3FF" ];

const QUICKSSH_CONFIG_FILE = "hyper-quickssh-config.json";

let reactHistoryNav;

let allTerminals = {};
let currTerminal;
let currFocusedUid;

let currPid = '';
let currUserInputData = '';
let lastKeyCodeTerminal = -1;
let currCwd = '/';
let quicksshEntries = [];

let supressMode = false;
let visor;
let visibleQuickComponent = false;

const navigation = {
  keys: {
    up: 38,
    down: 40
  }
};*/

const LEAD_KEY = 'CommandOrControl+Shift'//process.platform === 'darwin' ? 'Cmd' : 'Ctrl';

exports.decorateMenu = (menu) =>
  menu.map(
    item => {
      if (item.label !== 'Plugins') return item;
      const newItem = Object.assign({}, item);

      newItem.submenu = newItem.submenu.concat(
        {
          label: 'Quick SSH',
          type: 'submenu',
          submenu:[
            {
              label: 'Show/Hide List',
              accelerator: `${LEAD_KEY}+O`,
              click: (clickedItem, focusedWindow) => {
                console.log("yes");
                if (focusedWindow !== null) {
                  focusedWindow.rpc.emit('hyper-quickssh:open:window', { focusedWindow });
                }
              }
            },
            {
              label: 'Open Config',
              click: (clickedItem, focusedWindow) => {
                if (focusedWindow !== null) {
                  focusedWindow.rpc.emit('hyper-quickssh:open:config', { focusedWindow });
                }
              }
            }
          ],
        });
      return newItem;
    }
  );


const SSHUI = require('./src/ui.js');

let eventDispatch = {};

exports.decorateHyper = (Hyper, {React}) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      /*this.handleClick = this.handleClick.bind(this);
      this.handlePrefsClick = this.handlePrefsClick.bind(this);
      //this.handleKeyDown = this.handleKeyDown.bind(this);
      this.state = {
        cursor: 0,
        result: quicksshEntries
      }*/
    }
/*    handleClick(e) { }
    handlePrefsClick(e){
      openFilePrefs(e);
    }*/
    render() {
      //const color = require('color');
      //const { cursor } = this.state;
      //this.state.results = quicksshEntries;

      return (
        React.createElement(Hyper, Object.assign({}, this.props, {
          customChildren:
            SSHUI(React, eventDispatch)
        }))
      )
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
  win.rpc.on('hyper-ssh_execute-commands', ([uid, commands]) => {
    commands.forEach(cmd => {
      win.sessions.get(uid).write(cmd + '\r');
    });
  });
};

exports.onRendererWindow = win => {
  waitFor(win, 'rpc', rpc => {
    rpc.on('session add', details => {
      const { uid } = details;
      eventDispatch['rpc'] = rpc;
      eventDispatch['uid'] = uid;
    });
  });
};


//https://github.com/curz46/hyper-startup/blob/master/index.js
