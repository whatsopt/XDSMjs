/*
 * XDSMjs
 * Copyright 2016-2020 Rémi Lafage
 */
import { json } from 'd3-fetch';
import { select, event } from 'd3-selection';
import Graph from './graph';
import Xdsm, { VERSION1, VERSION2 } from './xdsm';

import Selectable from './selectable';
import Animation from './animation';
import Controls from './controls';

class SelectableXdsm {
  constructor(mdo, callback, config) {
    const graph = new Graph(mdo, config.withDefaultDriver);
    this.xdsm = new Xdsm(graph, 'root', config);
    this.xdsm.draw();
    this.selectable = new Selectable(this.xdsm, callback);
    this.selectable.enable();
  }

  updateMdo(mdo) {
    this.xdsm.updateMdo(mdo);
    this.selectable.enable();
  }

  setSelection(filter) {
    this.selectable.setFilter(filter);
  }
}

class XdsmFactory {
  constructor(config) {
    this._version = XdsmFactory._detectVersion() || VERSION2;
    this.default_config = {
      labelizer: {
        ellipsis: 5,
        subSupScript: true,
        showLinkNbOnly: false,
      },
      withDefaultDriver: true,
    };
    this._config = { ...this.default_config, ...config };
  }

  static get XDSM_V1() {
    return VERSION1;
  }

  static get XDSM_V2() {
    return VERSION2;
  }

  createXdsm(mdo) {
    const version = this._version;
    const elt = select(`.${version}`);
    if (elt.empty()) {
      console.log(`No element of ${version} class. Please add <div class="${version}"></div> in your HTML.`);
    } else if (mdo) {
      this._createXdsm(mdo, version);
    } else {
      const mdostr = elt.attr('data-mdo');
      if (mdostr) {
        this._createXdsm(JSON.parse(mdostr), version);
      } else {
        const filename = elt.attr('data-mdo-file') || 'xdsm.json';
        json(filename).then((mdoFromFile) => this._createXdsm(mdoFromFile, version));
      }
    }
  }

  createSelectableXdsm(mdo, callback) {
    return new SelectableXdsm(mdo, callback, this._config);
  }

  _createXdsm(mdo, version) {
    const xdsmNames = XdsmFactory._orderedList(mdo);

    // Optimization problem display setup
    select('body').selectAll('optpb').data(xdsmNames).enter()
      .append('div')
      .filter((d) => mdo[d].optpb)
      .attr('class', (d) => `optpb ${d}`)
      .style('opacity', 0)
      .on('click', function makeTransition() {
        select(this).transition().duration(500) // eslint-disable-line
          // no-invalid-this
          .style('opacity', 0)
          .style('pointer-events', 'none');
      })
      .append('pre')
      .html((d) => mdo[d].optpb);

    const xdsms = {};

    if (xdsmNames.indexOf('root') === -1) {
      // old format: mono xdsm
      const graph = new Graph(mdo, this._config.withDefaultDriver);
      xdsms.root = new Xdsm(graph, this._config);
      xdsms.root.draw();
    } else {
      // new format managing several XDSM
      xdsmNames.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(mdo, k)) {
          const graph = new Graph(mdo[k], this._config.withDefaultDriver);
          xdsms[k] = new Xdsm(graph, k, this._config);
          xdsms[k].draw();
          xdsms[k].svg.select('.optimization').on(
            'click',
            () => {
              const info = select(`.optpb.${k}`);
              info.style('opacity', 0.9);
              info.style('left', `${event.pageX}px`).style('top',
                `${event.pageY - 28}px`);
              info.style('pointer-events', 'auto');
            },
          );
        }
      }, this); // eslint-disable-line no-invalid-this
    }

    const anim = new Animation(xdsms);
    if (xdsms.root.hasWorkflow()) { // workflow is optional
      const ctrls = new Controls(anim, version); // eslint-disable-line no-unused-vars
    }
    anim.renderNodeStatuses();
  }

  static _detectVersion() {
    if (select(`.${VERSION1}`).empty()) {
      return VERSION2;
    }
    return VERSION1;
  }

  static _orderedList(xdsms, root, level) {
    const roo = root || 'root';
    const lev = level || 0;
    if (xdsms[roo]) {
      const subxdsms = xdsms[roo].nodes
        .map((n) => n.subxdsm)
        .filter((n) => n);
      let acc = [roo];
      if (subxdsms.length > 0) {
        for (let i = 0; i < subxdsms.length; i += 1) {
          acc = acc.concat(XdsmFactory._orderedList(xdsms, subxdsms[i], lev + 1));
        }
      }
      return acc;
    }
    if (lev === 0) {
      // level 0 no root : return lexicographic order
      return Object.keys(xdsms).sort();
    }
    throw new Error(`sub-XDSM '${roo}' not found among ${Object.keys(xdsms)}`);
  }
}

export default XdsmFactory;
