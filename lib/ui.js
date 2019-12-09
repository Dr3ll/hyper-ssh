"use strict";

const baseStyle = {
  position: 'absolute',
  top: '34px',
  bottom: '0',
  right: '0',
  width: '300px',
  background: 'rgba(255, 255, 255, .04)'
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

module.exports = (React, eventDispatch, sshMenuConfig) => {
  const setups = sshMenuConfig && sshMenuConfig.sshSetups ? sshMenuConfig.sshSetups : [];

  const uiBase = () => {
    const click = () => {
      rpc.emit('hyper-ssh_execute-commands', [eventDispatch.uid, [0]]);
    };

    return React.createElement("div", {
      style: baseStyle
    }, setups.map(setup => React.createElement(SSHSetupButton, {
      sshSetup: setup
    })));
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

  const SSHSetupButton = (_ref2) => {
    let {
      sshSetup
    } = _ref2;
    const cmds = [];

    const addTunnel = (_ref3) => {
      let {
        localPort,
        remoteHost,
        remotePort
      } = _ref3;

      if (remoteHost === undefined) {
        remoteHost = 'localhost';
      }

      return "-L ".concat(localPort, ":").concat(remoteHost, ":").concat(remotePort);
    };

    const addHost = (_ref4) => {
      let {
        user,
        hostName
      } = _ref4;
      return "".concat(user, "@").concat(hostName);
    }; // Build ssh command


    if (sshSetup && sshSetup.hostName) {
      let cmd = 'ssh';

      for (let tunnel of sshSetup.tunnels) {
        cmd += ' ' + addTunnel(tunnel);
      }

      cmd += ' ' + addHost(sshSetup);
      cmds.push(cmd);
    }

    return React.createElement(React.Fragment, null, React.createElement(CmdButton, {
      React: React,
      eventDispatch: eventDispatch,
      cmds: cmds,
      label: 'SSH'
    }));
  };

  return uiBase();
};