const TransferAction = require('./Actions/Transfer/Action');
const BuyTokenAction = require('./Actions/BuyToken/Action');

class Formulator {
  static formulate(pascalOperation, action, ledger, isSendOp) {
    let message = `${pascalOperation.block}/${pascalOperation.opBlock}:`;

    if ((action instanceof BuyTokenAction)) {
      message += `Account ${pascalOperation.senders[0].account.toString()} bought ` +
        `${ledger.calculateBuyAmount(pascalOperation.amount)} ${ledger.name} for ` +
        `${pascalOperation.amount.toString()} PASC`;
    } else if ((action instanceof TransferAction)) {
      if (isSendOp) {
        message += `Account ${pascalOperation.senders[0].account.toString()} send ` +
          `${action.amount} ${ledger.name} to ${action.destination.toString()}`;
      } else {
        message += `Account ${action.destination.toString()} received ${action.amount} ` +
          `${ledger.name} from ${pascalOperation.senders[0].account.toString()} `;
      }
    }
    return message;
  }
}

module.exports = Formulator;
