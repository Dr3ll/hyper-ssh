"use strict";

const baseStyle = {
  position: 'absolute',
  top: '34px',
  bottom: '0',
  right: '0',
  width: '300px',
  background: 'rgba(255, 255, 255, .04)'
};
const setupStyle = {
  height: '60py'
};
const sliceStyle = {
  padding: '5px'
};
const addButtonStyle = {
  height: '25px',
  width: '25px',
  padding: '5px',
  background: 'rgba(255, 155, 155, .5)',
  border: '0',
  color: 'white'
};
const setupButtonStyle = {
  padding: '5px',
  background: 'rgba(255, 155, 155, .5)',
  border: '0',
  color: 'white'
};
/*{
hostname:
port: 22
username: root
IPv4
IPv6

Tunnel
param: -L 9999:127.0.0.1:80 user@remoteserver
localPort:
remoteAddress: localhost
remotePort:
}*/

const UIState = {
  LIST: 1,
  NEW_SETUP: 2
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

module.exports = (React, eventDispatch, sshMenuConfig, saveConfig) => {
  const setups = sshMenuConfig && sshMenuConfig.sshSetups ? sshMenuConfig.sshSetups : [];

  const updateSetups = draft => {
    saveConfig(Object.assign({}, sshMenuConfig, {
      sshSetups: draft
    }));
  };

  const render = () => {
    return React.createElement(UIBase, null);
  };

  const UIBase = () => {
    let [uiState, setUIState] = React.useState({
      mode: UIState.LIST
    });

    const updateUIState = draft => {
      setUIState(Object.assign({}, uiState, draft));
    };

    return React.createElement("div", {
      style: baseStyle
    }, uiState.mode === UIState.LIST && React.createElement(React.Fragment, null, React.createElement("div", {
      style: sliceStyle
    }, React.createElement("button", {
      style: addButtonStyle,
      onClick: () => {
        updateUIState({
          mode: UIState.NEW_SETUP
        });
      }
    }, "+")), setups.map(setup => React.createElement("div", {
      style: sliceStyle,
      key: setup.id
    }, React.createElement(SSHSetup, {
      sshSetup: setup
    })))), uiState.mode === UIState.NEW_SETUP && React.createElement(NewSetupForm, {
      updateUI: updateUIState
    }));
  };

  const CmdButton = (_ref) => {
    let {
      cmds,
      label,
      style
    } = _ref;

    if (style === undefined) {
      style = {};
    }

    const postCmds = () => {
      if (cmds !== undefined && cmds.length > 0) {
        rpc.emit('hyper-ssh_execute-commands', [eventDispatch.uid, cmds]);
      }
    };

    return React.createElement(React.Fragment, null, React.createElement("button", {
      style: style,
      onClick: postCmds
    }, label));
  };

  const NewSetupForm = (_ref2) => {
    let {
      updateUI
    } = _ref2;
    const newSetup = {
      id: uuidv4()
    };
    const tunnelForms = [];
    const labelForm = React.useRef(null);
    const hostForm = React.useRef(null);
    const userForm = React.useRef(null);

    const addTunnel = () => {
      tunnelForms.push({
        localPort: React.useRef(null),
        remotePort: React.useRef(null),
        remoteHost: React.useRef(null)
      });
    };

    const saveSetup = () => {
      newSetup.label = labelForm.current.value;
      newSetup.host = hostForm.current.value;
      newSetup.user = userForm.current.value;

      if (tunnelForms.length > 0) {
        let tunnels = [];

        for (let tunnel of tunnelForms) {
          if (tunnel.remotePort && tunnel.remoteHost && tunnel.remoteHost) {
            tunnels.push({
              remotePort: tunnel.remotePort.current.value,
              remoteHost: tunnel.remoteHost.current.value,
              remoteHost: tunnel.remoteHost.current.value
            });
          }
        }
      }

      setups.push(newSetup);
      updateSetups(setups);
      updateUI({
        mode: UIState.LIST
      });
    };

    return React.createElement("div", null, React.createElement("div", null, React.createElement("label", null, "Label"), React.createElement("input", {
      ref: labelForm
    })), React.createElement("div", null, React.createElement("label", null, "Host"), React.createElement("input", {
      ref: hostForm
    })), React.createElement("div", null, React.createElement("label", null, "User"), React.createElement("input", {
      ref: userForm
    })), React.createElement("div", null, tunnelForms.map(tunnel => React.createElement("div", {
      style: sliceStyle
    }, React.createElement("label", null, "Source port"), React.createElement("input", {
      ref: tunnel.localPort
    }), React.createElement("label", null, "Destination"), React.createElement("input", {
      ref: tunnel.remoteHost
    }), React.createElement("label", null, "Destination port"), React.createElement("input", {
      ref: tunnel.remotePort
    })))), React.createElement("div", null, React.createElement("button", {
      onClick: addTunnel
    }, "Add tunnel")), React.createElement("div", null, React.createElement("button", {
      onClick: saveSetup
    }, "Done")));
  };

  const SSHSetup = (_ref3) => {
    let {
      sshSetup
    } = _ref3;
    const cmds = [];

    const addTunnel = (_ref4) => {
      let {
        localPort,
        remoteHost,
        remotePort
      } = _ref4;

      if (remoteHost === undefined) {
        remoteHost = 'localhost';
      }

      return "-L ".concat(localPort, ":").concat(remoteHost, ":").concat(remotePort);
    };

    const addHost = (_ref5) => {
      let {
        user,
        host
      } = _ref5;
      return "".concat(user, "@").concat(host);
    }; // Build ssh command


    if (sshSetup && sshSetup.host) {
      let cmd = 'ssh';

      if (sshSetup.tunnels) {
        for (let tunnel of sshSetup.tunnels) {
          cmd += ' ' + addTunnel(tunnel);
        }
      }

      cmd += ' ' + addHost(sshSetup);
      cmds.push(cmd);
    }

    return React.createElement("div", {
      style: setupStyle
    }, React.createElement(CmdButton, {
      style: setupButtonStyle,
      cmds: cmds,
      label: sshSetup.label
    }));
  };

  return render();
};