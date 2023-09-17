import { AudioLoader } from "audio_loader/audio_loader";
import { WaitingRoomEvent } from "src/core/event/event";
import { GameInfo, TemporaryRoomCreationInfo } from "src/core/game/game_props";
import { PlayerId } from "src/core/player/player_props";
import { RoomId } from "src/core/room/room";
import { Precondition } from "src/core/shares/libs/precondition/precondition";
import { GameMode, RoomMode } from "src/core/shares/types/room_props";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronData } from "src/electron_loader/electron_data";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { ImageLoader } from "src/image_loader/image_loader";
import { Background } from "src/pages/room/ui/background/background";
import { ServerHostTag, ServiceConfig } from "src/props/config_props";
import * as React from "react";
import { match } from "react-router-dom";
import { ConnectionService } from "src/services/connection_service/connection_service";
import IOSocketClient from "socket.io-client";
import { PagePropsWithConfig } from "src/types/page_props";
import { ChatBox } from "./chat_box/chat_box";
import { GameSettings } from "./game_settings/game_settings";
import { HeaderBar } from "./header_bar/header_bar";
import { installServices } from "./install";
import { Seats } from "./seats/seats";
import styles from "./waiting_room.module.css";
import {
  WaitingRoomPresenter,
  WaitingRoomStoreType,
} from "./waiting_room.presenter";
// import { useLocation, useParams } from "react-router-dom";

type WaitingRoomProps = PagePropsWithConfig<{
  match: match<{ slug: string }>;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  audioLoader: AudioLoader;
  electronLoader: ElectronLoader;
  getConnectionService(isCampaignMode: boolean): ConnectionService;
}>;

export function WaitingRoom(props: WaitingRoomProps) {
  const roomIdString = props.match.params.slug;
  const [gameHostedServer, setGameHostedServer] =
    React.useState<ServerHostTag>();
  const [hostPlayerId, setHostPlayerId] = React.useState<PlayerId>("");
  let socket: SocketIOClient.Socket;
  const [isHost, setIsHost] = React.useState<boolean>(false);
  let services: ReturnType<typeof installServices>;

  let selfPlayerId = Precondition.exists(
    props.electronLoader.getTemporaryData(ElectronData.PlayerId),
    "Unknown player id"
  );
  let selfPlayerName =
    props.electronLoader.getData(ElectronData.PlayerName) ||
    props.translator.tr("unknown");

  let presenter = WaitingRoomPresenter();
  let store: WaitingRoomStoreType = presenter.createStore(selfPlayerId);

  function initWithRoomInfo(roomInfo: TemporaryRoomCreationInfo) {
    const { campaignMode, coreVersion, hostPlayerId, ...settings } = roomInfo;
    setIsHost(() => selfPlayerId === hostPlayerId);

    setHostPlayerId(() => props.hostPlayerId);
    presenter.updateGameSettings(settings);
    services.roomProcessorService.saveSettingsLocally();
  }

  function backwardsToLoddy() {
    props.history.push("/lobby");
  }

  let joinIntoTheGame =
    (ping: number) => (roomId: RoomId, roomInfo: GameInfo) => {
      const hostConfig = props.config.host.find(
        (config) => config.hostTag === gameHostedServer
      );

      props.history.push(`/room/${roomId}`, {
        gameMode: roomInfo.gameMode,
        ping,
        hostConfig,
        roomMode: RoomMode.Online,
      });
    };

  function connectToServer(hostConfig: ServiceConfig) {
    const endpoint = `${hostConfig.protocol}://${hostConfig.host}:${hostConfig.port}/waiting-room-${roomIdString}`;
    socket = IOSocketClient(endpoint, {
      reconnection: true,
      autoConnect: true,
      reconnectionAttempts: 3,
      timeout: 180000,
    });
    setGameHostedServer(hostConfig.hostTag);
  }

  // const location: any = useLocation();

  const { ping, roomInfo } = props.location.state as {
    roomInfo?: TemporaryRoomCreationInfo;
    ping: number;
    hostConfig: ServiceConfig;
  };
  services = installServices(
    socket,
    props.translator,
    props.imageLoader,
    props.audioLoader,
    props.electronLoader,
    presenter,
    store,
    selfPlayerName,
    backwardsToLoddy,
    joinIntoTheGame(ping)
  );
  React.useState(() => {
    if (!props.match.params.slug) {
      backwardsToLoddy();
    }

    connectToServer(props.hostConfig);

    services.roomProcessorService.initWaitingRoomConnectionListeners();

    if (!roomInfo) {
      services.roomProcessorService.on(
        WaitingRoomEvent.PlayerEnter,
        (content) => {
          initWithRoomInfo(content.roomInfo);
        }
      );

      presenter.initSeatsInfo();
      services.eventSenderService.enterRoom(
        selfPlayerId,
        services.avatarService.getRandomAvatarIndex(),
        selfPlayerName,
        false
      );
    } else {
      initWithRoomInfo(roomInfo);
      services.eventSenderService.broadcast(WaitingRoomEvent.RoomCreated, {
        hostPlayerId: roomInfo.hostPlayerId,
        roomInfo,
      });
    }

    services.roomProcessorService.on("hostChange", (content) => {
      setIsHost(() => content.newHostPlayerId === selfPlayerId);
    });
    return () => {
      services.eventSenderService.leaveRoom(selfPlayerId);
      socket.disconnect();
    };
  });

  function validSettings() {
    const allPlayers = store.seats.filter(
      (seat) => !seat.seatDisabled && seat.playerId != null
    );
    if (store.gameSettings.gameMode === GameMode.OneVersusTwo) {
      return allPlayers.length === 3;
    } else if (store.gameSettings.gameMode === GameMode.TwoVersusTwo) {
      return allPlayers.length === 4;
    } else if (store.gameSettings.gameMode === GameMode.Pve) {
      return allPlayers.length === 2;
    } else if (store.gameSettings.gameMode === GameMode.Standard) {
      return allPlayers.length > 1;
    }

    return true;
  }

  function onSaveSettings() {
    services.eventSenderService.saveSettings(store.gameSettings);
    services.roomProcessorService.saveSettingsLocally();
  }

  return (
    <div className={styles.waitingRoom}>
      <Background image={props.imageLoader.getWaitingRoomBackgroundImage()} />
      <HeaderBar
        {...props}
        isCampaignMode={false}
        audioService={services.audioService}
        roomName={props.roomName}
        roomId={roomIdString}
        defaultPing={ping}
        host={gameHostedServer}
        variant="waitingRoom"
      />
      <div className={styles.mainContainer}>
        <div className={styles.playersPanel}>
          <Seats
            className={styles.seats}
            senderService={services.eventSenderService}
            translator={props.translator}
            presenter={presenter}
            store={store}
            avatarService={services.avatarService}
            imageLoader={props.imageLoader}
            isHost={isHost}
            validToStartGame={validSettings()}
            hostPlayerId={hostPlayerId}
            roomName={props.roomName}
          />
          <ChatBox
            translator={props.translator}
            senderService={services.eventSenderService}
            presenter={presenter}
            store={store}
            playerName={props.electronLoader.getData(ElectronData.PlayerName)}
          />
        </div>
        <GameSettings
          className={styles.gameSettings}
          translator={props.translator}
          imageLoader={props.imageLoader}
          presenter={presenter}
          store={store}
          controlable={isHost}
          onSave={onSaveSettings}
        />
      </div>
    </div>
  );
}
