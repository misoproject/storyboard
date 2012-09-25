var _ = require("lodash");
_.mixin(require("underscore.deferred"));

<%= misoScene %>

// Expose the module
module.exports = this.Miso;