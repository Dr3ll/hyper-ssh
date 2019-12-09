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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

module.exports = (React, eventDispatch, sshMenuConfig, saveConfig) => {

  const setups = sshMenuConfig && sshMenuConfig.sshSetups ? sshMenuConfig.sshSetups : [];

  const updateSetups = (draft) => {
    saveConfig(Object.assign({},
      sshMenuConfig,
      { sshSetups: draft }
    ));
  };

  const render = () => {
    return <UIBase />
  };

  const UIBase = () => {
    let [uiState, setUIState] = React.useState({ mode: UIState.LIST });

    const updateUIState = (draft) => {
      setUIState(Object.assign({}, uiState, draft));
    };

    return <div style={baseStyle}>
      { uiState.mode === UIState.LIST &&
      <>
        <div style={sliceStyle}>
          <button style={addButtonStyle} onClick={() => {
            updateUIState({ mode: UIState.NEW_SETUP});
          }}>
            +
          </button>
        </div>
        {
          setups.map((setup) =>
            <div style={sliceStyle} key={setup.id}>
              <SSHSetup sshSetup={setup}/>
            </div>
          )
        }
      </>
      }
      {
        uiState.mode === UIState.NEW_SETUP &&
        <NewSetupForm updateUI={updateUIState} />
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

  const NewSetupForm = ({updateUI}) => {

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
      })
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
                localPort: tunnel.localPort.current.value,
                remoteHost: tunnel.remoteHost.current.value
              })
          }
        }
      }

      setups.push(newSetup);
      updateSetups(setups);
      updateUI({ mode: UIState.LIST });
    };

    return <div>
      <div>
        <label>Label</label>
        <input ref={labelForm}/>
      </div>
      <div>
        <label>Host</label>
        <input ref={hostForm}/>
      </div>
      <div>
        <label>User</label>
        <input ref={userForm}/>
      </div>
      <div>
        {
          tunnelForms.map((tunnel) =>
            <div style={sliceStyle}>
              <label>Source port</label>
              <input ref={tunnel.localPort}/>
              <label>Destination</label>
              <input ref={tunnel.remoteHost}/>
              <label>Destination port</label>
              <input ref={tunnel.remotePort}/>
            </div>
          )
        }
      </div>
      <div>
        <button onClick={addTunnel}>Add tunnel</button>
      </div>
      <div>
        <button onClick={saveSetup}>Done</button>
      </div>
    </div>
      ;
  };

  const SSHSetup = ({sshSetup}) => {

    const cmds = [];

    const addTunnel = ({localPort, remoteHost, remotePort}) => {
      if (remoteHost === undefined) { remoteHost = 'localhost'}

      return `-L ${localPort}:${remoteHost}:${remotePort}`;
    };

    const addHost = ({user, host}) => {
      return `${user}@${host}`;
    };

    // Build ssh command
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

    return <div style={setupStyle}>
      <CmdButton
        style={setupButtonStyle}
        cmds={cmds}
        label={sshSetup.label}
      />
    </div>
      ;
  };
  return render();
};
