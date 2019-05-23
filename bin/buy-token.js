const Config = require('./../key');
const DataOperation = require('@pascalcoin-sbx/signing').Operations.Data.Operation;
const RawOperations = require('@pascalcoin-sbx/signing').RawOperations;
const RawOperationsCoder = require('@pascalcoin-sbx/signing').RawOperationsCoder;
const prompt = require('prompt');
const BuyAction = require('./../src/Actions/BuyToken/Action');
const BuyActionCoder = require('./../src/Actions/BuyToken/Coder');
const ContractCoder = require('./../src/Actions/Contract/Coder');

prompt.start();

Config.RPC.findOperation({ophash: Config.Contract.OpHash})
  .execute()
  .then(([op]) => {
    let token = new ContractCoder().decodeFromBytes(op.payload);

    console.log('Name: ' + token.name);
    console.log('Price: ' + token.price.toMolina() + ' Molina');
    console.log('Supply: ' + token.supply.toString());

    prompt.get(['account', 'amount'], (err, result) => {
      const payload = new BuyAction(Config.Contract.OpHash);

      Config.RPC.getAccount({account: result.account})
        .execute()
        .then(([account, accountTransformer]) => {
          let op = new DataOperation(account.account, account.account, Config.Contract.Account);

          op.withPayload(new BuyActionCoder().encodeToBytes(payload));
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

  });
