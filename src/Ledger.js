const BN = require('bn.js');
const P_CONTRACT_OPHASH = Symbol('contract_ophash');

const P_CONTRACT_PASCAL_OPERATION = Symbol('contract_pascal_operation');
const P_CONTRACT_ACTION = Symbol('contract_action');
const P_ACCOUNTS = Symbol('accounts');
const P_BUYABLE = Symbol('buyable');

const M_ADD_BUY_OPERATION = Symbol('add_buy_operation');
const M_ADD_TRANSFER_OPERATION = Symbol('add_transfer_operation');
const M_ADD_ACCOUNT = Symbol('add_account');

const ContractActionCoder = require('./Actions/Contract/Coder');
const BuyTokenActionCoder = require('./Actions/BuyToken/Coder');
const TransferActionCoder = require('./Actions/Transfer/Coder');
const Account = require('./Account');

/**
 * A simple ledger that will keep data updated according to the operations that
 * are added.
 */
class Ledger {
  constructor(contractOpHash) {
    /**
     * Constructor
     * @param {OperationHash} contractOpHash
     */
    this[P_CONTRACT_OPHASH] = contractOpHash;
    this[P_ACCOUNTS] = {};
  }

  /**
   * Sets the data of the contract.
   *
   * @param {Action} pascalContractOperation
   */
  setContractData(pascalContractOperation) {
    let contractAction = this.tryParseAction(pascalContractOperation.payload, new ContractActionCoder(), 2);

    if (contractAction === null) {
      throw new Error('Invalid token contract');
    }

    this[P_CONTRACT_PASCAL_OPERATION] = pascalContractOperation;
    this[P_CONTRACT_ACTION] = contractAction;
    this[P_BUYABLE] = contractAction.supply;
  }

  /**
   * Gets the pasa that hosts the token.
   *
   * @return {AccountNumber}
   */
  get pasa() {
    return this[P_CONTRACT_PASCAL_OPERATION].senders[0].account;
  }

  /**
   * Gets the price for a single token.
   *
   * @return {Currency}
   */
  get price() {
    return this[P_CONTRACT_ACTION].price;
  }

  /**
   * Gets the supply of the token.
   *
   * @return {BN}
   */
  get supply() {
    return this[P_CONTRACT_ACTION].supply;
  }

  /**
   * Gets the name of the token.
   *
   * @return {String}
   */
  get name() {
    return this[P_CONTRACT_ACTION].name;
  }

  get contractOpHash() {
    return this[P_CONTRACT_OPHASH];
  }

  get contractPascalOperation() {
    return this[P_CONTRACT_PASCAL_OPERATION];
  }

  /**
   * Adds an operation to the ledger and depending on the type, it will
   * trigger the according actions.
   *
   * @param {Operation} pascalOperation
   */
  addOperation(pascalOperation) {
    const transferAction = this.tryParseAction(pascalOperation.payload, new TransferActionCoder(), 4);

    if (transferAction !== null) {
      this[M_ADD_TRANSFER_OPERATION](pascalOperation, transferAction);
      return;
    }

    const buyAction = this.tryParseAction(pascalOperation.payload, new BuyTokenActionCoder(), 1);

    if (buyAction !== null) {
      this[M_ADD_BUY_OPERATION](pascalOperation, buyAction);
      return;
    }
  }

  /**
   * Gets an account identified by the given account number.
   *
   * @param {AccountNumber} accountNumber
   * @return {Account}
   */
  getAccount(accountNumber) {
    return this[P_ACCOUNTS][accountNumber.account];
  }

  /**
   * Gets an account identified by the given account number.
   *
   * @param {AccountNumber} accountNumber
   * @return {Account}
   */
  getAccounts() {
    return Object.values(this[P_ACCOUNTS]);
  }

  /**
   * Adds an account to the list of accounts with zero balance (idempotent)
   *
   * @param {AccountNumber} accountNumber
   */
  [M_ADD_ACCOUNT](accountNumber) {
    if (this[P_ACCOUNTS][accountNumber.account] === undefined) {
      this[P_ACCOUNTS][accountNumber.account] = new Account(accountNumber);
    }
  }

  calculateBuyAmount(pascal) {
    return new BN(
      pascal.toMolina()).div(new BN(this.price.toMolina())
    );
  }

  /**
   * Adds a buy operation.
   *
   * @param {Operation} pascalOperation
   * @param {Action} buyAction
   */
  [M_ADD_BUY_OPERATION](pascalOperation, buyAction) {

    // calculate the amount of tokens to assign
    let amountOfTokens = this.calculateBuyAmount(pascalOperation.amount);

    // add the account if not already there
    let sender = pascalOperation.senders[0].account;

    this[M_ADD_ACCOUNT](sender);
    if (this[P_BUYABLE].gte(amountOfTokens)) {

      // update buyable
      this[P_BUYABLE] = this[P_BUYABLE].sub(amountOfTokens);

      // update account balance and add operation data
      this.getAccount(sender).addAmount(amountOfTokens, pascalOperation, buyAction);
    } else {
      this.getAccount(sender).addErrorOperation(
        pascalOperation, buyAction,
        'Cannot buy more than what is left.'
      );
    }
  }

  /**
   * Adds a buy operation.
   *
   * @param {Operation} pascalOperation
   * @param {Action} transferAction
   */
  [M_ADD_TRANSFER_OPERATION](pascalOperation, transferAction) {

    // add the account if not already there
    let sender = pascalOperation.senders[0].account;

    this[M_ADD_ACCOUNT](sender);

    // does the sender has enough funds?
    if (this.getAccount(sender).balance.lt(transferAction.amount)) {
      this.getAccount(sender).addErrorOperation(
        pascalOperation, transferAction,
        `Insufficient funds to send ${transferAction.amount} ${this.name} to ${transferAction.destination.toString()}`
      );
      return;
    }

    this[M_ADD_ACCOUNT](transferAction.destination);
    this.getAccount(sender).subAmount(transferAction.amount, pascalOperation, transferAction);
    this.getAccount(transferAction.destination).addAmount(transferAction.amount, pascalOperation, transferAction);
  }

  /**
   * Tries to parse an operation payload and either returns the buy action
   * or null.
   *
   * @param {BC} payload
   * @param {CompositeType} coder
   * @return {null|Action}
   */
  tryParseAction(payload, coder, dataType) {
    try {
      let action = coder.decodeFromBytes(payload);

      if (action.dataType === dataType) {

        if (dataType !== 2 && !action.contract.equals(this[P_CONTRACT_OPHASH])) {
          return null;
        }

        return action;
      }
    } catch (e) {
      return null;
    }

    return null;
  }
}
module.exports = Ledger;
