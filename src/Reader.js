const P_LEDGER = Symbol('ledger');
const P_RPC = Symbol('rpc');
const M_READ_OPS = Symbol('read_operations');

class Reader {
  /**
   *
   * @param {RPCClient} rpc
   * @param {Ledger} ledger
   */
  constructor(rpc, ledger) {
    this[P_RPC] = rpc;
    this[P_LEDGER] = ledger;
  }

  read(report) {
    report('reading contract');
    return new Promise((resolve, reject) => {
      this[P_RPC].findOperation({ophash: this[P_LEDGER].contractOpHash})
        .execute()
        .then(([tokenOp, transform]) => {
          this[P_LEDGER].setContractData(transform(tokenOp));
          report('Name: ' + this[P_LEDGER].name);
          report('Supply: ' + this[P_LEDGER].supply);
          report('Price: ' + this[P_LEDGER].price.toStringOpt());

          this[M_READ_OPS](report).then(() => resolve());
        });
    });
  }

  [M_READ_OPS](report) {
    report('reading operations');
    const contractOperation = this[P_LEDGER].contractPascalOperation;

    let action = this[P_RPC].getAccountOperations({
      account: this[P_LEDGER].pasa,
      depth: 1000000
    });

    return new Promise((resolve, reject) => {
      action.executeAll().then(([ops, transform]) => {
        ops = transform(ops.reverse());
        ops.forEach((op) => {

          // first check its a data operation
          if (op.opType !== 10) {
            console.log('skip wrong optype');
          }

          // now check if the operation happened after the contract op
          if (op.block < contractOperation.block) {
            console.log('skip - before token contract');
            return;
          }

          if (op.block === contractOperation.block && op.opBlock <= contractOperation.opBlock) {
            console.log('skip - before token contract');
            return;
          }

          if (op.subType !== 104) {
            console.log('skip - invalid subtype');
            return;
          }

          this[P_LEDGER].addOperation(op);
          resolve();
        });
      });
    });
  }
}

module.exports = Reader;
