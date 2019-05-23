const BuyTokenAction = require('./../src/Actions/BuyToken/Action');
const BuyTokenCoder = require('./../src/Actions/BuyToken/Coder');
const DataOperation = require('@pascalcoin-sbx/signing').Operations.Data.Operation;
const RawOperations = require('@pascalcoin-sbx/signing').RawOperations;
const RawOperationsCoder = require('@pascalcoin-sbx/signing').RawOperationsCoder;

const P_RPC = Symbol('rpc');
const P_LEDGER = Symbol('ledger');

const M_EXECUTE_OPERATION = Symbol('execute_operation');

class Wallet {
  constructor(rpc, ledger) {
    this[P_RPC] = rpc;
    this[P_LEDGER] = ledger;
  }

  buyToken(keyPair, account, token, amount) {
    const payload = new BuyTokenAction(this[P_LEDGER].contractOpHash);
  }

  [M_EXECUTE_OPERATION](sender, target, actionPayload) {
    return new Promise((resolve, reject) => {
      this[P_RPC].getAccount({account: account})
        .execute()
        .then(([account, accountTransformer]) => {
          account = accountTransformer(account);
          let op = new DataOperation(account.account, account.account, Config.Contract.Account);

          op.withPayload(new BuyPayloadCoder().encodeToBytes(payload));
          op.withDataSequence(0);
          op.withDataType(2001);
          op.withAmount(token.price.mul(result.amount));
          op.withNOperation(account.n_operation + 1);

          let opList = new RawOperations();

          opList.addOperation(Config.Contract.KeyPair, op);

          Config.RPC.executeOperations({
            rawoperations: new RawOperationsCoder().encodeToBytes(opList)
          }).execute().then(([operations, transform]) => {
            console.log(operations);
          });
        });

    });
  }
}

module.exports = Wallet;
