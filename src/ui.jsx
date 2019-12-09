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

    return <div style={baseStyle}>
      {
        setups.map((setup) =>
          <SSHSetupButton sshSetup={setup}/>
        )
      }
    </div>
      ;
  };

  const CmdButton = ({cmds, label, style}) => {

    if (style === undefined) {
      style = {};
    }

    const postCmds = () => {
      if (cmds !== undefined && cmds.length > 0) {
        rpc.emit('hyper-ssh_execute-commands', [eventDispatch.uid, cmds]);
      }
    };

    return <>
      <button
        style={style}
        onClick={postCmds}
      >{label}</button>
    </>
      ;
  };

  const SSHSetupButton = ({sshSetup}) => {

    const cmds = [];

    const addTunnel = ({localPort, remoteHost, remotePort}) => {
      if (remoteHost === undefined) { remoteHost = 'localhost'}

      return `-L ${localPort}:${remoteHost}:${remotePort}`;
    };

    const addHost = ({user, hostName}) => {
      return `${user}@${hostName}`;
    };

    // Build ssh command
    if (sshSetup && sshSetup.hostName) {
      let cmd = 'ssh';

      for (let tunnel of sshSetup.tunnels) {
        cmd += ' ' + addTunnel(tunnel);
      }

      cmd += ' ' + addHost(sshSetup);
      cmds.push(cmd);
    }

    return <>
      <CmdButton
      React={React}
      eventDispatch={eventDispatch}
      cmds={cmds}
      label={'SSH'}
    />
    </>
      ;
  };
  return uiBase();
};
