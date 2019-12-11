"use strict";

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

    return <div class='hyper-putty-base'>
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
    const [tunnelForms, setTunnels] = React.useState([]);
    const labelForm = React.useRef(null);
    const hostForm = React.useRef(null);
    const userForm = React.useRef(null);

    const addTunnel = () => {
      tunnelForms.push({
        id: tunnelForms.length.toString(),
        localPort: '',
        remotePort: '',
        remoteHost: ''
      });
      setTunnels([...tunnelForms]);
    };

    const validatePort = (draft, old) => {
      if (draft === undefined || draft === '') {
        return '';
      }
      draft = parseInt(draft);
      if (draft > 0 && draft <= 65535) {
        return draft / 1;
      }
      return old;
    };

    const handleTunnelRPChange = ({target}) => {
      for (let t of tunnelForms) {
        if (t.id === target.id) {
          t.remotePort = validatePort(target.value, t.remotePort);
          target.value = t.remotePort;
          break;
        }
      }
    };
    const handleTunnelRHChange = ({target}) => {
      for (let t of tunnelForms) {
        if (t.id === target.id) {
          t.remoteHost = target.value;
          break;
        }
      }
    };
    const handleTunnelLPChange = ({target}) => {
      for (let t of tunnelForms) {
        if (t.id === target.id) {
          t.localPort = validatePort(target.value, t.localPort);
          target.value = t.localPort;
          break;
        }
      }
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
                remotePort: tunnel.remotePort,
                localPort: tunnel.localPort,
                remoteHost: tunnel.remoteHost
              })
          }
        }
        newSetup.tunnels = tunnels;
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
            <div key={tunnel.id} style={sliceStyle}>
              <label>Source port</label>
              <input id={tunnel.id} onChange={handleTunnelLPChange} />
              <label>Destination</label>
              <input id={tunnel.id} onChange={handleTunnelRHChange}/>
              <label>Destination port</label>
              <input id={tunnel.id} onChange={handleTunnelRPChange}/>
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
