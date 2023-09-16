import { Logger } from '/src/core/shares/libs/logger/logger';
import { ClientConfig } from '/src/props/config_props';
import { RouteComponentProps } from 'react-router-dom';

export type PagePropsWithConfig<T = {}> = T &
  RouteComponentProps & {
    config: ClientConfig;
    logger: Logger;
  };
