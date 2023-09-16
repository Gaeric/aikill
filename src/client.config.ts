import { Precondition } from '/src/core/shares/libs/precondition/precondition';
import { Languages } from '/src/core/translations/translation_json_tool';
import { ClientConfig, ClientFlavor, ServerHostTag, ServiceConfig, UiConfigTypes } from '/src/props/config_props';

const uiConfig: UiConfigTypes = {
  language: Languages.ZH_CN,
};

export const getClientConfig = (mode: ClientFlavor): ClientConfig => {
  let host: ServiceConfig[];

  switch (mode) {
    case ClientFlavor.Dev:
      host = [
        {
          port: 8086,
          host: 'localhost',
          protocol: 'http',
          hostTag: ServerHostTag.Localhost,
        },
      ];
      break;
    case ClientFlavor.Web:
    case ClientFlavor.Desktop:
    case ClientFlavor.Mobile:
      host = [
        {
          port: 8086,
          host: '146.56.218.109',
          protocol: 'http',
          hostTag: ServerHostTag.NanJing,
        },
      ];
      break;
    default:
      throw Precondition.UnreachableError(mode);
  }
  return {
    ui: uiConfig,
    host,
    flavor: mode,
  };
};
