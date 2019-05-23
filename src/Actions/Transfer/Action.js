const BC = require('@pascalcoin-sbx/common').BC;
const AccountNumber = require('@pascalcoin-sbx/common').Types.AccountNumber;
const BN = require('bn.js');

const P_CONTRACT = Symbol('contract');
const P_DESTINATION = Symbol('destination');
const P_AMOUNT = Symbol('amount');
const P_PAYLOAD = Symbol('payload');

/**
 * A simple transfer object.
 */
class Action {

  /**
   * Constructor.
   *
   * @param {AccountNumber} destination
   * @param {Currency} amount
   */
  constructor(contract, destination, amount, payload) {
    this[P_CONTRACT] = contract;
    this[P_DESTINATION] = new AccountNumber(destination);
    this[P_AMOUNT] = new BN(amount);
    this[P_PAYLOAD] = BC.from(payload);
  }

  get dataType() {
    return 4;
  }

  /**
   * Gets the destination pasa.
   *
   * @return {AccountNumber}
   */
  get destination() {
    return this[P_DESTINATION];
  }

  /**
   * Gets the amount that was transferred.
   *
   * @return {BN}
   */
  get amount() {
    return this[P_AMOUNT];
  }

  /**
   * Gets the payload used for the op.
   *
   * @return {BC}
   */
  get payload() {
    return this[P_PAYLOAD];
  }
  /**
   * Gets the payload used for the op.
   *
   * @return {OperationHash}
   */
  get contract() {
    return this[P_CONTRACT];
  }
}

module.exports = Action;
