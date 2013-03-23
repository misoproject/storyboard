var _ = require("lodash");
_.mixin(require("underscore.deferred"));

<%= misoStoryboard %>

// Expose the module
module.exports = this.Miso;
