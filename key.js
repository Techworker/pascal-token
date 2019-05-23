const OperationHashCoder = require('@pascalcoin-sbx/common').Coding.Pascal.OperationHash;
const Keys = require('@pascalcoin-sbx/crypto').Keys;
const PrivateKeyCrypt = require('@pascalcoin-sbx/crypto').Encryption.Pascal.PrivateKey;

let keyPair = Keys.fromPrivateKey(
  PrivateKeyCrypt.decrypt(
    '53616C7465645F5FD127A670D9D3F3120B0EE5719D50024F2E375B6BC72C2824097FF65F4A98E493CA3A9C3090B60CB51B2901C964576A40370F1783B287561B',
    {password: 'test123'}
  )
);

const RPCClient = require('@pascalcoin-sbx/json-rpc').Client;

module.exports = {
  Contract: {
    Account: 1554326,
    KeyPair: keyPair,
    OpHash: new OperationHashCoder().decodeFromBytes('D8BE040096B7170003000000AF0663C5F2196415C16120B501C8756B81759AE1')
  },
  RPC: RPCClient.factory('http://127.0.0.1:4103')
};
