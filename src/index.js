import XdsmFactory from './xdsm-factory';

// eslint-disable-next-line import/prefer-default-export
export function XDSMjs(config) {
  return new XdsmFactory(config);
}

export const { XDSM_V1 } = XdsmFactory;
export const { XDSM_V2 } = XdsmFactory;
