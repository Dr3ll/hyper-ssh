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
    paddingTop: '5px',
    paddingBottom: '5px'
  };

  const sliceFormStyle = {
    paddingTop: '2px',
    paddingBottom: '2px'
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
    let [uiToggle, setUIToggle] = React.useState(false);

    const toggleUI = () => {
      setUIToggle(!uiToggle);
    };

    rpc.on('hyper-ssh-menu_openList', () => {
      toggleUI();
    });

    const updateUIState = (draft) => {
      setUIState(Object.assign({}, uiState, draft));
    };

    return <div style={{display: uiToggle ?'block' : 'none'}} className='hyper-ssh-menu-base'>
      { uiState.mode === UIState.LIST &&
      <>
        <div style={sliceStyle}>
          <button className='hyper-ssh-menu-add-button' onClick={() => {
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

  const NewSetupForm = ({updateUI}) => {

    const newSetup = { id: uuidv4() };
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

    return <div className='hyper-ssh-menu-form'>
      <div style={sliceFormStyle}>
        <label>Label</label>
        <input ref={labelForm}/>
      </div>
      <div style={sliceFormStyle}>
        <label>Host</label>
        <input ref={hostForm}/>
      </div>
      <div style={sliceFormStyle}>
        <label>User</label>
        <input ref={userForm}/>
      </div>
      <div style={{ paddingTop: '10px' }}>
        {tunnelForms.length > 0 && <div style={{ marginBottom: '-5px' }}>Tunnels</div>}
        {
          tunnelForms.map((tunnel) =>
            <div style={{ paddingTop: '5px', paddingBottom: '5px' }} key={tunnel.id}>
              <div style={sliceFormStyle}>
                <label>Source port</label>
                <input id={tunnel.id} onChange={handleTunnelLPChange} />
              </div>
              <div style={sliceFormStyle}>
                <label>Destination</label>
                <input id={tunnel.id} onChange={handleTunnelRHChange}/>
              </div>
              <div style={sliceFormStyle}>
                <label>Dest. port</label>
                <input id={tunnel.id} onChange={handleTunnelRPChange}/>
              </div>
            </div>
          )
        }
      </div>
      <div style={Object.assign({ display: 'flex', justifyContent: 'flex-end', paddingRight: '2px' }, sliceStyle)}>
        <button className='hyper-ssh-menu-button' style={{ width: '180px' }} onClick={addTunnel} title='Add SSH connection'>Add tunnel</button>
      </div>
      <div style={sliceStyle}>
        <button className='hyper-ssh-menu-button' onClick={saveSetup}>Done</button>&nbsp;
        <button className='hyper-ssh-menu-button' onClick={() => {updateUI({ mode: UIState.LIST })}}>Cancel</button>
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
      <div style={{width: '70%'}}>
        {sshSetup.label}
      </div>
      <CmdButton
        cmds={cmds}
        label={'Open'}
      />
      <CmdButton
        cmds={cmds}
        label={'Open New'}
      />
    </div>
      ;
  };

  const CmdButton = ({cmds, label}) => {
    const postCmds = () => {
      if (cmds !== undefined && cmds.length > 0) {
        rpc.emit('hyper-ssh_execute-commands', [eventDispatch.uid, cmds]);
      }
    };

    return <>
      <div
        className='hyper-ssh-menu-setup'
        onClick={postCmds}
      >{label}</div>
    </>
      ;
  };

  return render();
};
