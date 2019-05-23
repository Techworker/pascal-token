const Currency = require('@pascalcoin-sbx/common').Types.Currency;

const P_CONTRACT = Symbol('contract');
const P_NAME = Symbol('name');
const P_SUPPLY = Symbol('supply');
const P_PRICE = Symbol('price');

/**
 * Represents a token.
 */
class Action {
  /**
   * Constructor.
   *
   * @param {OperationHash} contract
   * @param {String} name
   * @param {Currency} supply
   * @param {Currency} price
   */
  constructor(contract, name, supply, price) {

    this[P_CONTRACT] = contract;
    this[P_NAME] = name;
    this[P_SUPPLY] = new Currency(supply);
    this[P_PRICE] = new Currency(price);
  }


  get dataType() {
    return 3;
  }

  /**
   * Gets the name of the token.
   *
   * @return {String}
   */
  get name() {
    return this[P_NAME];
  }

  /**
   * Gets the total supply of the token.
   *
   * @return {Currency}
   */
  get supply() {
    return this[P_SUPPLY];
  }

  /**
   * Gets the total supply of the token.
   *
   * @return {Currency}
   */
  get price() {
    return this[P_PRICE];
  }

  /**
   * Gets the total supply of the token.
   *
   * @return {OperationHash}
   */
  get contract() {
    return this[P_CONTRACT];
  }
}

module.exports = Action;
