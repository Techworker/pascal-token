/**
 * Copyright (c) Benjamin Ansbach - all rights reserved.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Coding = require('@pascalcoin-sbx/common').Coding;
const Endian = require('@pascalcoin-sbx/common').Endian;
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
    super('token');
    this.description('A token definition');
    this.addSubType(
      new Coding.Core.Int8('dataType')
        .description('The reference to the main token.')
    );
    this.addSubType(
      new Coding.Core.StringWithLength('name')
        .description('The name of the token.')
    );
    this.addSubType(
      new Coding.Core.Int64('supply', true, Endian.LITTLE_ENDIAN)
        .description('The supply.')
    );
    this.addSubType(
      new Coding.Pascal.Currency('price', true, Endian.LITTLE_ENDIAN)
        .description('The price of a token.')
    );
  }


  decodeFromBytes(bc, options = {
    toArray: false
  }, all = null) {
    let decoded = super.decodeFromBytes(bc, options, all);

    return new Action(decoded.name, decoded.supply, decoded.price);
  }
}

module.exports = Coder;
