const Config = require('./../key');
const OperationHashCoder = require('@pascalcoin-sbx/common').Coding.Pascal.OperationHash;
const prompt = require('prompt');
const BuyPayloadCoder = require('./../src/Payloads/BuyCoder');
const BN = require('bn.js');
const TransferPayloadCoder = require('./../src/Payloads/TransferCoder');
const TokenPayloadCoder = require('./../src/Payloads/TokenCoder');

const opHashCoder = new OperationHashCoder();

prompt.start();

class Balance {
  constructor(account) {
    this.account = account;
    this.balance = new BN('0');
  }

  add(amount) {
    this.balance.add(amount);
  }

  sub(amount) {
    this.balance.sub(amount);
  }
}

class Ledger {
  constructor(name, supply, price) {
    this.name = name;
    this.supply = supply;
    this.buyable = supply;
    this.price = price;
    this.balances = {};
    this.operations = {};
  }

  addAccount(account) {
    if (this.balances[account] === undefined) {
      this.balances[account] = new Balance(account);
    }

    return this.balances[account];
  }

  buy(account, amountPasc) {
    let amountOfTokens = new BN(amountPasc.toMolina()).div(new BN(this.price.toMolina()));

    if (this.buyable.gte(amountOfTokens)) {
      this.buyable = this.buyable.sub(amountOfTokens);
      this.addAccount(account);
      this.balances[account].add(amountOfTokens);
      if (this.operations[account] === undefined) {
        this.operations[account] = [];
      }
      this.operations[account].push('Bought ' + amountOfTokens.toString());
    } else {
      throw new Error('Cannot buy more than what is left.');
    }
  }

  transfer(from, to, amount) {
    this.addAccount(from);
    this.addAccount(to);

    this.balances[from].sub(amount);
    this.balances[to].add(amount);
    if (this.operations[from] === undefined) {
      this.operations[from] = [];
    }
    if (this.operations[to] === undefined) {
      this.operations[to] = [];
    }
    this.operations[from].push('Send ' + amount.toString() + ' to ' + to);
    this.operations[to].push('Received ' + amount.toString() + ' from ' + from);
  }
}

Config.RPC.findOperation({ophash: Config.Contract.OpHash})
  .execute()
  .then(([tokenOp, transform]) => {
    tokenOp = transform(tokenOp);
    let token = new TokenPayloadCoder().decodeFromBytes(tokenOp.payload);

    let ledger = new Ledger(token.name, token.supply, token.price);

    console.log('Name: ' + token.name);
    console.log('Price: ' + token.price.toMolina() + ' Molina');
    console.log('Supply: ' + token.supply.toString());

    Config.RPC.getAccountOperations({
      account: Config.Contract.Account,
      depth: 1000000
    }).executeAll().then(([ops, transform]) => {
      ops = transform(ops.reverse());
      ops.forEach((op) => {
        if (op.opType !== 10) {
          console.log('skip wrong optype');
        }

        if (op.block < tokenOp.block) {
          console.log('skip - before token contract');
          return;
        }
        if (op.block === tokenOp.block && op.opBlock <= tokenOp.opBlock) {
          console.log('skip - before token contract');
          return;
        }

        if (op.subType !== 104) {
          console.log('skip - invalid subtype');
          return;
        }

        try {
          let buy = new BuyPayloadCoder().decodeFromBytes(op.payload);

          if (buy.dataType === 1) {
            if (!buy.contract.equals(tokenOp.opHash)) {
              console.log('skip: bad contract');
              return;
            }

            ledger.buy(op.senders[0].account.account, op.amount);
            return;
          }
        } catch (e) {
          console.log(e);
        }

        try {
          let transfer = new TransferPayloadCoder().decodeFromBytes(op.payload);

          if (transfer.dataType === 4) {
            if (!transfer.contract.equals(tokenOp.opHash)) {
              console.log('skip: bad contract');
              return;
            }

            ledger.transfer(op.senders[0].account.account, transfer.destination.account, transfer.amount);
            return;
          }
        } catch (e) {
          //console.log(e);
          return;
        }
      });
      console.log(ledger);
    });
  });
