import Q from 'q';

let callbacks = {};
let requestNonce = 0;

class LitClient {
  constructor () {
    this.host = location.hostname;
    this.port = location.port;
    this.rpccon = new WebSocket('ws://' + this.host + ':' + this.port + '/ws');
    let deferred = Q.defer();
    this.waitForConnection = deferred.promise;
    this.rpccon.onopen = () => {
      deferred.resolve();
    };

    this.rpccon.onmessage = (message) => {
      let data = JSON.parse(message.data);
      if(data.error !== null) {
        callbacks[data.id].reject(data.error);
        delete callbacks[data.id];
      }else {
        callbacks[data.id].resolve(data.result);
        delete callbacks[data.id];
      }
    };
  }
  send (method, ...args) {
    let deferred = Q.defer();
    let id = requestNonce++;
    this.waitForConnection.then(() => {
      this.rpccon.send(JSON.stringify({'method': method, 'params': args, 'id': id}));
    });
    callbacks[id] = deferred;

    return deferred.promise;
  }
}

let lc = new LitClient();

export default lc;