import XdsmFactory from './xdsm-factory.js';

export function XDSMjs(config) {
  return new XdsmFactory(config);
}

export const { XDSM_V1 } = XdsmFactory;
export const { XDSM_V2 } = XdsmFactory;
