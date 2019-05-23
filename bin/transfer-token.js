const Config = require('./../key');
const AccountNumber = require('@pascalcoin-sbx/common').Types.AccountNumber;
const DataOperation = require('@pascalcoin-sbx/signing').Operations.Data.Operation;
const RawOperations = require('@pascalcoin-sbx/signing').RawOperations;
const RawOperationsCoder = require('@pascalcoin-sbx/signing').RawOperationsCoder;
const BN = require('bn.js');
const BC = require('@pascalcoin-sbx/common').BC;
const prompt = require('prompt');
const TransferPayload = require('./../src/Payloads/Transfer');
const TransferPayloadCoder = require('./../src/Payloads/TransferCoder');
const TokenPayloadCoder = require('./../src/Payloads/TokenCoder');

prompt.start();

Config.RPC.findOperation({ophash: Config.Contract.OpHash})
  .execute()
  .then(([op]) => {
    let token = new TokenPayloadCoder().decodeFromBytes(op.payload);

    console.log('Name: ' + token.name);
    console.log('Price: ' + token.price.toMolina() + ' Molina');
    console.log('Supply: ' + token.supply.toString());

    prompt.get(['from', 'to', 'amount', 'payload'], (err, result) => {
      const payload = new TransferPayload(
        Config.Contract.OpHash,
        new AccountNumber(result.to),
        new BN(result.amount),
        BC.fromString(result.payload)
      );

      Config.RPC.getAccount({account: result.from})
        .execute()
        .then(([account, accountTransformer]) => {
          let op = new DataOperation(account.account, account.account, Config.Contract.Account);

          op.withPayload(new TransferPayloadCoder().encodeToBytes(payload));
          op.withDataSequence(0);
          op.withDataType(2002);
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
