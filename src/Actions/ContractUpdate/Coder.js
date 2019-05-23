/**
 * Copyright (c) Benjamin Ansbach - all rights reserved.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Coding = require('@pascalcoin-sbx/common').Coding;
const Endian = require('@pascalcoin-sbx/common').Endian;
const CompositeType = Coding.CompositeType;

/**
 * The raw coder for a BuyAccount operation.
 */
class Coder extends CompositeType {
  /**
   * Constructor
   */
  constructor() {
    super('token_update');
    this.description('Token update');
    this.addSubType(
      new Coding.Core.Int8('dataType')
        .description('The reference to the main token.')
    );
    this.addSubType(
      new Coding.Pascal.OperationHash('contract')
        .description('The reference to the main token.')
    );
    this.addSubType(
      new Coding.Core.StringWithLength('name')
        .description('The name of the token.')
    );
    this.addSubType(
      new Coding.Pascal.Currency('supply', true, Endian.LITTLE_ENDIAN)
        .description('The supply.')
    );
    this.addSubType(
      new Coding.Pascal.Currency('price', true, Endian.LITTLE_ENDIAN)
        .description('The price of a token.')
    );
  }
}

module.exports = Coder;
