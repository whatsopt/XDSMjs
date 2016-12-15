var d3 = require('d3');
var Animation = require('./animation');

function Controls(animation) {
  this.animation = animation;

  this.startButton = d3.select('button#start');
  this.stopButton = d3.select('button#stop');
  this.stepButton = d3.select('button#step');

  this.startButton.on('click', (function() {
    this.animation.start();
  }).bind(this));
  this.stopButton.on('click', (function() {
    this.animation.stop();
  }).bind(this));
  this.stepButton.on('click', (function() {
    this.animation.step();
  }).bind(this));

  this.animation.addObserver(this);
  this.update(this.animation.status);
}

Controls.prototype.update = function(status) {
  switch (status) {
    case Animation.STATUS.STOPPED:
    case Animation.STATUS.DONE:
      this.animation.reset();  // trigger INIT status
    case Animation.STATUS.INIT: // eslint-disable-line no-fallthrough
      this._enable(this.startButton);
      this._disable(this.stopButton);
      this._enable(this.stepButton);
      break;
    case Animation.STATUS.STARTED:
      this._disable(this.startButton);
      this._enable(this.stopButton);
      this._disable(this.stepButton);
      break;
    case Animation.STATUS.STEPPED:
      this._disable(this.startButton);
      this._enable(this.stopButton);
      this._enable(this.stepButton);
      break;
    default:
      console.log("Unexpected Event: " + status);
      break;
  }
};

Controls.prototype._enable = function(button) {
  button.attr("disabled", null);
};

Controls.prototype._disable = function(button) {
  button.attr("disabled", true);
};

module.exports = Controls;
