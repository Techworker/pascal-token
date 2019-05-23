const Reader = require('./src/Reader');
const Ledger = require('./src/Ledger');
const Formulator = require('./src/Formulator');
const RPCClient = require('@pascalcoin-sbx/json-rpc').Client;
const OperationHashCoder = require('@pascalcoin-sbx/common').Coding.Pascal.OperationHash;
const Keys = require('@pascalcoin-sbx/crypto').Keys;
const PrivateKeyCrypt = require('@pascalcoin-sbx/crypto').Encryption.Pascal.PrivateKey;

let keyPair = Keys.fromPrivateKey(
  PrivateKeyCrypt.decrypt(
    '53616C7465645F5FD127A670D9D3F3120B0EE5719D50024F2E375B6BC72C2824097FF65F4A98E493CA3A9C3090B60CB51B2901C964576A40370F1783B287561B',
    {password: 'test123'}
  )
);

let ledger = new Ledger(
  new OperationHashCoder().decodeFromBytes('D8BE040096B7170003000000AF0663C5F2196415C16120B501C8756B81759AE1')
);
const rpc = RPCClient.factory('http://127.0.0.1:4103');

let ledgerReader = new Reader(rpc, ledger);

ledgerReader.read((m) => console.log(m)).then(() => {
  console.log('finished');
  ledger.getAccounts().forEach((account) => {
    console.log(`account: ${account.pasa.toString()}`);
    console.log(`balance: ${account.balance.toString()}`);
    console.log('history');
    account.balances.forEach((b) => {
      if (b.op !== null) {
        console.log(' - ' + Formulator.formulate(b.op, b.action, ledger, b.type === 'sub'));
      }
    });
  });
});
