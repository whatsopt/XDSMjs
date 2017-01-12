var d3 = require('d3');
var Animation = require('./animation');

function Controls(animation) {
  this.animation = animation;

  this.startButton = d3.select('button#start');
  this.stopButton = d3.select('button#stop');
  this.stepPrevButton = d3.select('button#step-prev');
  this.stepNextButton = d3.select('button#step-next');

  this.startButton.on('click', (function() {
    this.animation.start();
  }).bind(this));
  this.stopButton.on('click', (function() {
    this.animation.stop();
  }).bind(this));
  this.stepPrevButton.on('click', (function() {
    this.animation.stepPrev();
  }).bind(this));
  this.stepNextButton.on('click', (function() {
    this.animation.stepNext();
  }).bind(this));

  this.animation.addObserver(this);
  this.update(this.animation.status);
}

Controls.prototype.update = function(status) {
  // console.log("Controls receives: "+status);
  switch (status) {
    case Animation.STATUS.STOPPED:
    case Animation.STATUS.DONE:
      this.animation.reset();  // trigger READY status
    case Animation.STATUS.READY: // eslint-disable-line no-fallthrough
      this._enable(this.startButton);
      this._disable(this.stopButton);
      this._enable(this.stepNextButton);
      this._enable(this.stepPrevButton);
      break;
    case Animation.STATUS.RUNNING_AUTO:
      this._disable(this.startButton);
      this._enable(this.stopButton);
      this._disable(this.stepNextButton);
      this._disable(this.stepPrevButton);
      break;
    case Animation.STATUS.RUNNING_STEP:
      this._disable(this.startButton);
      this._enable(this.stopButton);
      this._enable(this.stepNextButton);
      this._enable(this.stepPrevButton);
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
