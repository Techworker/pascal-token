const Config = require('./../key');
const DataOperation = require('@pascalcoin-sbx/signing').Operations.Data.Operation;
const RawOperations = require('@pascalcoin-sbx/signing').RawOperations;
const RawOperationsCoder = require('@pascalcoin-sbx/signing').RawOperationsCoder;
const Currency = require('@pascalcoin-sbx/common').Types.Currency;
const prompt = require('prompt');

prompt.start();

prompt.get(['name', 'supply', 'price'], (err, result) => {

  const ContractAction = require('./../src/Actions/Contract/Action');
  const ContractActionCoder = require('./../src/Actions/Contract/Coder');

  const action = new ContractAction(result.name, result.supply, Currency.fromMolina(result.price));

  Config.RPC.getAccount({account: Config.Contract.Account})
    .execute()
    .then(([account, accountTransformer]) => {
      let op = new DataOperation(Config.Contract.Account, Config.Contract.Account, Config.Contract.Account);

      op.withPayload(new ContractActionCoder().encodeToBytes(action));
      op.withDataSequence(0);
      op.withDataType(2000);
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
