import { getAudioLoader } from "src/audio_loader/audio_loader_util";
import { Sanguosha } from "src/core/game/engine";
import { Logger } from "src/core/shares/libs/logger/logger";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { getImageLoader } from "src/image_loader/image_loader_util";
import { CharactersList } from "src/pages/characters_list/characters_list";
import { OpenningPage } from "src/pages/openning/openning";
import { ReplayRoomPage } from "src/pages/room/replay_room";
import { RoomPage } from "src/pages/room/room";
import { WaitingRoom } from "src/pages/waiting_room/waiting_room";
import { ClientConfig } from "src/props/config_props";
import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { CampaignService } from "src/services/campaign_service/campaign_service";
import { getConnectionService } from "src/services/connection_service/connection_service_util";
import { CharacterSkinInfo } from "src/skins/skins";
import { installEventEmitter } from "src/utils/install_event_emitter";
import Lobby from "./pages/lobby/lobby";

function App(props: {
  config: ClientConfig;
  electronLoader: ElectronLoader;
  translator: ClientTranslationModule;
  logger: Logger;
}) {
  let skinData: CharacterSkinInfo[];
  let imageLoader = getImageLoader(props.config.flavor);
  let audioLoader = getAudioLoader(props.config.flavor);
  let campaignService = new CampaignService(props.logger, props.config.flavor);
  let connectionService = getConnectionService(props.config);
  let fakeConnectionService = getConnectionService(props.config);
  function getConnectionService2(campaignMode: boolean) {
    return campaignMode ? fakeConnectionService : connectionService;
  }

  // async getSkinData() {
  //   const url = import.meta.env.PUBLIC_URL + '/skin_infos.json';
  //   await fetch(url)
  //     .then(res => res.json())
  //     .catch(error => console.error(error))
  //     .then(response => (skinData = response));
  // }
  // React.useEffect(() => {
  // getSkinData();
  // });
  if (document.title) {
    document.title =
      props.translator.tr("New QSanguosha") + " - " + Sanguosha.Version;
    installEventEmitter();
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <OpenningPage
            config={props.config}
            location={location}
            logger={props.logger}
          />
        }
      />

      {props.electronLoader ? (
        <Route
          path={"/lobby"}
          element={
            <Lobby
              config={props.config}
              translator={props.translator}
              location={location}
              imageLoader={imageLoader}
              audioLoader={audioLoader}
              electronLoader={props.electronLoader}
              connectionService={connectionService}
              campaignService={campaignService}
              logger={props.logger}
            />
          }
        />
      ) : (
        <Route
          path={"/openning"}
          element={
            <OpenningPage
              config={props.config}
              location={location}
              history={history}
              logger={props.logger}
            />
          }
        />
      )}
      <Route
        path={"/replay"}
        element={
          <ReplayRoomPage
            location={location}
            history={history}
            skinData={skinData}
            imageLoader={imageLoader}
            audioLoader={audioLoader}
            electronLoader={props.electronLoader}
            config={props.config}
            translator={props.translator}
            connectionService={fakeConnectionService}
            logger={props.logger}
          />
        }
      />
      <Route
        path={"/characters"}
        element={
          <CharactersList
            location={location}
            history={history}
            skinData={skinData}
            imageLoader={imageLoader}
            audioLoader={audioLoader}
            electronLoader={props.electronLoader}
            config={props.config}
            translator={props.translator}
            logger={props.logger}
          />
        }
      />
      <Route
        path={"/waiting-room/:slug"}
        element={
          <WaitingRoom
            location={location}
            history={history}
            imageLoader={imageLoader}
            audioLoader={audioLoader}
            electronLoader={props.electronLoader}
            config={props.config}
            translator={props.translator}
            getConnectionService={getConnectionService2}
            logger={props.logger}
          />
        }
      />
      <Route
        path={"/room/:slug"}
        element={
          <RoomPage
            location={location}
            history={history}
            skinData={skinData}
            imageLoader={imageLoader}
            audioLoader={audioLoader}
            electronLoader={props.electronLoader}
            config={props.config}
            translator={props.translator}
            getConnectionService={getConnectionService2}
            logger={props.logger}
          />
        }
      />
    </Routes>
  );
}
export default React.memo(App);
