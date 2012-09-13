var _ = require("lodash");
_.mixin(require("underscore.deferred"));

<%= misoRig %>

// Expose the module
module.exports = this.Miso;