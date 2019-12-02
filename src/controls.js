
import { select } from 'd3-selection';
import Animation from './animation';

function Controls(animation) {
  this.animation = animation;

  const buttonGroup = select('.xdsm-toolbar')
    .append('div')
    .classed('button_group', true);
  buttonGroup.append('button')
    .attr('id', 'start')
    .append('i').attr('class', 'icon-start');
  buttonGroup.append('button')
    .attr('id', 'stop')
    .append('i').attr('class', 'icon-stop');
  buttonGroup.append('button')
    .attr('id', 'step-prev')
    .append('i').attr('class', 'icon-step-prev');
  buttonGroup.append('button')
    .attr('id', 'step-next')
    .append('i').attr('class', 'icon-step-next');

  this.startButton = select('button#start');
  this.stopButton = select('button#stop');
  this.stepPrevButton = select('button#step-prev');
  this.stepNextButton = select('button#step-next');

  this.startButton.on('click', () => {
    this.animation.start();
  });
  this.stopButton.on('click', () => {
    this.animation.stop();
  });
  this.stepPrevButton.on('click', () => {
    this.animation.stepPrev();
  });
  this.stepNextButton.on('click', () => {
    this.animation.stepNext();
  });

  this.animation.addObserver(this);
  this.update(this.animation.status);
}

Controls.prototype.update = function update(status) {
  // console.log("Controls receives: "+status);
  switch (status) {
    case Animation.STATUS.STOPPED:
    case Animation.STATUS.DONE:
      this.animation.reset(); // trigger READY status
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
      console.log(`Unexpected Event: ${status}`);
      break;
  }
};

Controls.prototype._enable = function _enable(button) {
  button.attr('disabled', null);
};

Controls.prototype._disable = function _disable(button) {
  button.attr('disabled', true);
};

export default Controls;
