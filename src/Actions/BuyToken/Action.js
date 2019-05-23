const P_CONTRACT = Symbol('contract');

class Action {
  constructor(contract) {
    this[P_CONTRACT] = contract;
  }

  get dataType() {
    return 1;
  }

  get contract() {
    return this[P_CONTRACT];
  }
}

module.exports = Action;
