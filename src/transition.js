(function(global, _, $) {

  var Miso = global.Miso = global.Miso || {};

  Miso.Transition = function( config ) {
    this.name = config.name;
    this.from = config.from;
    this.to = config.to;
    this.before = config.before;
    this.after = config.after;
    this.intro = config.intro;
    this.outro = config.outro;
  }

  _.extend(Miso.Transition.prototype, {
    _forFsm : function() {
      return {
        name : this.name,
        from : this.from,
        to : this.to,
      }
    }
  });

}(this, _, $));




