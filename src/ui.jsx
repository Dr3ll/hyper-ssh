"use strict";

module.exports = (React, eventDispatch) => {
  const click = () => {
    rpc.emit('hyper-ssh_execute-commands', [eventDispatch.uid, [0]]);
  };

  return <div style={{position:'absolute', bottom: '0'}}>
    <button onClick={click}> hurray</button>
  </div>
    ;
};
