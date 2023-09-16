import { getAudioLoader } from '/src/audio_loader/audio_loader_util';
import { Sanguosha } from '/src/core/game/engine';
import { Logger } from '/src/core/shares/libs/logger/logger';
import { ClientTranslationModule } from '/src/core/translations/translation_module.client';
import { ElectronLoader } from '/src/electron_loader/electron_loader';
import { createMemoryHistory } from 'history';
import { getImageLoader } from '/src/image_loader/image_loader_util';
import * as mobxReact from 'mobx-react';
import { CharactersList } from '/src/pages/characters_list/characters_list';
import { OpenningPage } from '/src/pages/openning/openning';
import { ReplayRoomPage } from '/src/pages/room/replay_room';
import { RoomPage } from '/src/pages/room/room';
import { WaitingRoom } from '/src/pages/waiting_room/waiting_room';
import { ClientConfig } from '/src/props/config_props';
import * as React from 'react';
import { Redirect, Route, Router } from 'react-router-dom';
import { CampaignService } from '/src/services/campaign_service/campaign_service';
import { getConnectionService } from '/src/services/connection_service/connection_service_util';
import { CharacterSkinInfo } from '/src/skins/skins';
import { installEventEmitter } from '/src/utils/install_event_emitter';
import { Lobby } from './pages/lobby/lobby';

@mobxReact.observer
export class App extends React.PureComponent<{
  config: ClientConfig;
  electronLoader: ElectronLoader;
  translator: ClientTranslationModule;
  logger: Logger;
}> {
  private customHistory = createMemoryHistory();
  private skinData?: CharacterSkinInfo[];
  private imageLoader = getImageLoader(this.props.config.flavor);
  private audioLoader = getAudioLoader(this.props.config.flavor);
  private connectionService = getConnectionService(this.props.config);
  private fakeConnectionService = getConnectionService(this.props.config, true);
  private campaignService = new CampaignService(this.props.logger, this.props.config.flavor);

  // async getSkinData() {
  //   const url = process.env.PUBLIC_URL + '/skin_infos.json';
  //   await fetch(url)
  //     .then(res => res.json())
  //     .catch(error => console.error(error))
  //     .then(response => (this.skinData = response));
  // }
  componentDidMount() {
    // this.getSkinData();
    document.title = this.props.translator.tr('New QSanguosha') + ' - ' + Sanguosha.Version;
    installEventEmitter();
  }

  private readonly getConnectionService = (campaignMode: boolean) =>
    campaignMode ? this.fakeConnectionService : this.connectionService;

  render() {
    return (
      <Router history={this.customHistory}>
        <div>
          <Route path={'/'} exact>
            <Redirect to={'openning'} />
          </Route>
          <Route
            path={'/openning'}
            render={({ match, location, history }) => (
              <OpenningPage
                config={this.props.config}
                match={match}
                location={location}
                history={history}
                logger={this.props.logger}
              />
            )}
          />
          {this.props.electronLoader ? (
            <Route
              path={'/lobby'}
              render={({ match, location, history }) => (
                <Lobby
                  config={this.props.config}
                  match={match}
                  translator={this.props.translator}
                  location={location}
                  history={history}
                  imageLoader={this.imageLoader}
                  audioLoader={this.audioLoader}
                  electronLoader={this.props.electronLoader}
                  connectionService={this.connectionService}
                  campaignService={this.campaignService}
                  logger={this.props.logger}
                />
              )}
            />
          ) : (
            <Route
              path={'/openning'}
              render={({ match, location, history }) => (
                <OpenningPage
                  config={this.props.config}
                  match={match}
                  location={location}
                  history={history}
                  logger={this.props.logger}
                />
              )}
            />
          )}
          <Route
            path={'/replay'}
            render={({ match, location, history }) => (
              <ReplayRoomPage
                location={location}
                history={history}
                match={match}
                skinData={this.skinData}
                imageLoader={this.imageLoader}
                audioLoader={this.audioLoader}
                electronLoader={this.props.electronLoader}
                config={this.props.config}
                translator={this.props.translator}
                connectionService={this.fakeConnectionService}
                logger={this.props.logger}
              />
            )}
          />
          <Route
            path={'/characters'}
            render={({ match, location, history }) => (
              <CharactersList
                location={location}
                history={history}
                match={match}
                skinData={this.skinData}
                imageLoader={this.imageLoader}
                audioLoader={this.audioLoader}
                electronLoader={this.props.electronLoader}
                config={this.props.config}
                translator={this.props.translator}
                logger={this.props.logger}
              />
            )}
          />
          <Route
            path={'/waiting-room/:slug'}
            render={({ match, location, history }) => (
              <WaitingRoom
                location={location}
                history={history}
                match={match}
                imageLoader={this.imageLoader}
                audioLoader={this.audioLoader}
                electronLoader={this.props.electronLoader}
                config={this.props.config}
                translator={this.props.translator}
                getConnectionService={this.getConnectionService}
                logger={this.props.logger}
              />
            )}
          />
          <Route
            path={'/room/:slug'}
            render={({ match, location, history }) => (
              <RoomPage
                location={location}
                history={history}
                match={match}
                skinData={this.skinData}
                imageLoader={this.imageLoader}
                audioLoader={this.audioLoader}
                electronLoader={this.props.electronLoader}
                config={this.props.config}
                translator={this.props.translator}
                getConnectionService={this.getConnectionService}
                logger={this.props.logger}
              />
            )}
          />
        </div>
      </Router>
    );
  }
}

export default App;
