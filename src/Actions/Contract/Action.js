const Currency = require('@pascalcoin-sbx/common').Types.Currency;
const BN = require('bn.js');

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
   * @param {String} name
   * @param {BN} supply
   * @param {Currency} price
   */
  constructor(name, supply, price) {
    this[P_NAME] = name;
    this[P_SUPPLY] = new BN(supply);
    this[P_PRICE] = new Currency(price);
  }

  get dataType() {
    return 2;
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
   * @return {BN}
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
}

module.exports = Action;
