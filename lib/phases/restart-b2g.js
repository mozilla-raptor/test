var Reboot = require('./reboot');
var util = require('util');

/**
 * Create a phase which achieves a ready state when b2g has been restarted
 * @param {{
 *   runs: Number,
 *   timeout: Number,
 *   retries: Number
 * }} options
 * @constructor
 */
var RestartB2G = function(options) {
  Reboot.call(this, options);
};

util.inherits(RestartB2G, Reboot);

RestartB2G.prototype.title = 'Restart B2G';
RestartB2G.prototype.name = 'restartb2g';
RestartB2G.prototype.START_MARK = 'deviceB2GStart';

/**
 * Perform a b2g restart. Override the functionality in the Reboot base.
 * @returns {Promise}
 */
RestartB2G.prototype.restart = function() {
  return this.device.restartB2G();
};

module.exports = RestartB2G;
