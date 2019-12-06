module.exports = SSHUI = (React, eventDispatch) => {

  const click = () => {
    rpc.emit('hyper-ssh_execute-commands', [eventDispatch.uid, [0]]);
  };

  return React.createElement('div', {
    style: {
      position: 'absolute',
      bottom: '0'
    }
    },
    React.createElement('button',
      { onClick:
          click
      }
    , 'press')
    )
    ;
};
