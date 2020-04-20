import XdsmFactory from './xdsm-factory';

// eslint-disable-next-line import/prefer-default-export
export function XDSMjs(config) {
  return new XdsmFactory(config);
}
