/**
 * Copyright (c) Benjamin Ansbach - all rights reserved.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Coding = require('@pascalcoin-sbx/common').Coding;
const CompositeType = Coding.CompositeType;
const Action = require('./Action');

/**
 * The raw coder for a BuyAccount operation.
 */
class Coder extends CompositeType {
  /**
   * Constructor
   */
  constructor() {
    super('buy');
    this.description('Buy');
    this.addSubType(
      new Coding.Core.Int8('dataType')
        .description('The reference to the main token.')
    );
    this.addSubType(
      new Coding.Pascal.OperationHash('contract')
        .description('The reference to the main token.')
    );
  }


  decodeFromBytes(bc, options = {
    toArray: false
  }, all = null) {
    let decoded = super.decodeFromBytes(bc, options, all);

    return new Action(decoded.contract);
  }
}

module.exports = Coder;
