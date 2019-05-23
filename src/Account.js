const BN = require('bn.js');
const P_PASA = Symbol('pasa');
const P_BALANCES = Symbol('balance');
const P_ERRORS = Symbol('errors');

class Account {
  constructor(pasa) {
    this[P_PASA] = pasa;
    this[P_BALANCES] = [{
      op: null,
      action: null,
      balance: new BN(0)
    }];
    this[P_ERRORS] = [];
  }

  /**
   *
   * @param amount
   */
  addAmount(amount, pascalOperation, action) {
    this[P_BALANCES].push({
      type: 'add',
      op: pascalOperation,
      action,
      balance: this[P_BALANCES][this[P_BALANCES].length - 1].balance.add(amount)
    });
  }

  /**
   *
   * @param amount
   */
  subAmount(amount, pascalOperation, action) {
    this[P_BALANCES].push({
      type: 'sub',
      op: pascalOperation,
      action,
      balance: this[P_BALANCES][this[P_BALANCES].length - 1].balance.sub(amount)
    });
  }

  addErrorOperation(pascalOperation, action, error) {
    this[P_ERRORS].push({
      op: pascalOperation,
      action,
      error
    });
  }

  get pasa() {
    return this[P_PASA];
  }

  get balance() {
    return this[P_BALANCES][this[P_BALANCES].length - 1].balance;
  }

  get balances() {
    return this[P_BALANCES];
  }

  get errors() {
    return this[P_ERRORS];
  }
}

module.exports = Account;
