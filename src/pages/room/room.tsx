import { AudioLoader } from "audio_loader/audio_loader";
import {
  clientActiveListenerEvents,
  GameEventIdentifiers,
  ServerEventFinder,
} from "src/core/event/event";
import { EventPacker } from "src/core/event/event_packer";
import { Sanguosha } from "src/core/game/engine";
import { TemporaryRoomCreationInfo } from "src/core/game/game_props";
import { LocalClientEmitter } from "src/core/network/local/local_emitter.client";
import { ClientSocket } from "src/core/network/socket.client";
import { Player } from "src/core/player/player";
import { PlayerId } from "src/core/player/player_props";
import { Precondition } from "src/core/shares/libs/precondition/precondition";
import { RoomMode } from "src/core/shares/types/room_props";
import { TranslationPack } from "src/core/translations/translation_json_tool";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronData } from "src/electron_loader/electron_data";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { ImageLoader } from "src/image_loader/image_loader";
import { SettingsDialog } from "src/pages/ui/settings/settings";
import { ServerHostTag, ServiceConfig } from "src/props/config_props";
import * as React from "react";

import { ConnectionService } from "src/services/connection_service/connection_service";
import { CharacterSkinInfo } from "src/skins/skins";
import { PagePropsWithConfig } from "src/types/page_props";
import { installAudioPlayerService } from "src/ui/audio/install";
import { GameClientProcessor } from "./game_processor";
import { installService, RoomBaseService } from "./install_service";
import styles from "./room.module.css";
import { RoomPresenter } from "./room.presenter";
import { RoomStore } from "./room.store";
import { Background } from "./ui/background/background";
import { Banner } from "./ui/banner/banner";
import { Dashboard } from "./ui/dashboard/dashboard";
import { GameDialog } from "./ui/game_dialog/game_dialog";
import { GameBoard } from "./ui/gameboard/gameboard";
import { SeatsLayout } from "./ui/seats_layout/seats_layout";
import { useLocation, useParams } from "react-router-dom";

/* todo: RoomPage onetime init */
export function RoomPage(props: PagePropsWithConfig) {
  let presenter = RoomPresenter(props.imageLoader).newRoomPresent;
  let store = presenter.store;
  // let socket: ClientSocket;
  let gameProcessor: GameClientProcessor;
  let storeRef = React.useRef(store);
  let presenterRef = React.useRef(presenter);
  let roomId: number = Number(useParams().slug);
  presenterRef.current = presenter;
  React.useEffect(() => {
    storeRef.current = store;
  }, [store]);
  let playerName: string =
    props.electronLoader.getData(ElectronData.PlayerName) || "unknown";
  let playerId: PlayerId = Precondition.exists(
    props.electronLoader.getTemporaryData(ElectronData.PlayerId),
    "unknown player id"
  );
  let baseService: RoomBaseService;
  let audioService = installAudioPlayerService(
    props.audioLoader,
    props.electronLoader
  );

  let connectionService: ConnectionService;

  let lastEventTimeStamp: number;

  let roomPing: number = 999;

  let gameHostedServer: ServerHostTag;

  let [openSettings, setOpenSettings] = React.useState(false);

  let defaultMainVolume = props.electronLoader.getData(ElectronData.MainVolume)
    ? Number.parseInt(props.electronLoader.getData(ElectronData.MainVolume), 10)
    : 50;

  let defaultGameVolume = props.electronLoader.getData(ElectronData.GameVolume)
    ? Number.parseInt(props.electronLoader.getData(ElectronData.GameVolume), 10)
    : 50;

  let [renderSideBoard, setRenderSideBoard] = React.useState<boolean>(true);

  let settings = {
    onVolumeChange: (volume: number) => {
      props.electronLoader.setData(ElectronData.GameVolume, volume.toString());
      defaultGameVolume = volume;
      audioService.changeGameVolume();
    },
    onMainVolumeChange: (volume: number) => {
      props.electronLoader.setData(ElectronData.MainVolume, volume.toString());
      defaultMainVolume = volume;
      audioService.changeBGMVolume();
    },
  };

  const location: any = useLocation();

  const { ping, hostConfig, roomMode, socket } = location.state;

  /* todo: should delete */
  connectionService = props.getConnectionService(
    roomMode === RoomMode.Campaign
  );
  gameHostedServer = hostConfig.hostTag;

  if (ping !== undefined) {
    () => (roomPing = ping);
  }

  gameProcessor = React.useRef(
    new GameClientProcessor(
      presenterRef,
      storeRef,
      props.translator,
      props.imageLoader,
      audioService,
      props.electronLoader,
      props.skinData,
      createWaitingRoomCaller
    )
  ).current;

  baseService = installService(props.translator, store, props.imageLoader);

  function createWaitingRoomCaller(
    roomInfo: TemporaryRoomCreationInfo,
    roomId: number
  ) {
    props.history.push(`/waiting-room/${roomId}`, {
      ping: 0,
      hostConfig: props.config.host.find(
        (host) => host.hostTag === gameHostedServer
      ),
    });
  }

  async function onHandleBulkEvents(
    events: ServerEventFinder<GameEventIdentifiers>[]
  ) {
    store.room!.emitStatus("trusted", playerId!);
    for (const content of events) {
      const identifier = Precondition.exists(
        EventPacker.getIdentifier(content),
        "Unable to load event identifier"
      );
      await gameProcessor.onHandleIncomingEvent(identifier, content);
      `call back of client event onhandle event ${identifier}`;
      showMessageFromEvent(content);
      updateGameStatus(content);
    }
  }

  function setupReconnection() {
    socket.onReconnected(() => {
      if (!playerId) {
        return;
      }
      socket.notify(
        GameEventIdentifiers.PlayerReenterEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.PlayerReenterEvent,
          {
            timestamp: lastEventTimeStamp,
            playerId,
            playerName: playerName,
          }
        )
      );
    });
  }

  function disconnect() {
    if (roomMode === RoomMode.Campaign) {
      socket.disconnect();
    } else {
      socket.notify(
        GameEventIdentifiers.PlayerLeaveEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.PlayerLeaveEvent,
          {
            playerId: store.clientPlayerId,
          }
        )
      );
    }
  }

  function updateGameStatus(event: ServerEventFinder<GameEventIdentifiers>) {
    const info = EventPacker.getGameRunningInfo(event);
    presenter.updateNumberOfDrawStack(info.numberOfDrawStack);
    presenter.updateGameCircle(info.circle);
  }

  function animation<T extends GameEventIdentifiers>(
    identifier: T,
    event: ServerEventFinder<T>
  ) {
    baseService.Animation.GuideLineAnimation.animate(identifier, event);
    baseService.Animation.MoveInstantCardAnimation.animate(identifier, event);
  }

  function showMessageFromEvent(
    event: ServerEventFinder<GameEventIdentifiers>
  ) {
    if (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent
    ) {
      for (const info of (
        event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>
      ).infos) {
        const {
          messages = [],
          translationsMessage,
          unengagedMessage,
          engagedPlayerIds,
        } = info;

        if (
          unengagedMessage &&
          engagedPlayerIds &&
          !engagedPlayerIds.includes(store.clientPlayerId)
        ) {
          messages.push(TranslationPack.create(unengagedMessage).toString());
        } else if (translationsMessage) {
          messages.push(TranslationPack.create(translationsMessage).toString());
        }

        messages.forEach((message) => {
          presenterRef.current.addGameLog(props.translator.trx(message));
        });
      }
    } else {
      const {
        messages = [],
        translationsMessage,
        unengagedMessage,
        engagedPlayerIds,
      } = event;

      if (
        unengagedMessage &&
        engagedPlayerIds &&
        !engagedPlayerIds.includes(store.clientPlayerId)
      ) {
        messages.push(TranslationPack.create(unengagedMessage).toString());
      } else if (translationsMessage) {
        messages.push(TranslationPack.create(translationsMessage).toString());
      }

      messages.forEach((message) => {
        presenterRef.current.addGameLog(props.translator.trx(message));
      });
    }
  }

  function onTrusted() {
    gameProcessor.onPlayTrustedAction();
  }

  function onClickSettings() {
    setOpenSettings(true);
  }

  function onCloseSettings() {
    setOpenSettings(false);
  }

  function onSwitchSideBoard() {
    let render = !renderSideBoard;
    setRenderSideBoard(() => render);
    return render;
  }
  function onChangeObserver(player: Player) {
    socket.notify(GameEventIdentifiers.ObserverRequestChangeEvent, {
      observerId: playerId,
      toObserverId: player.Id,
    });
    presenterRef.current.setupClientPlayerId(player.Id);
    props.translator.setupPlayer(player);
    // presenterRef.broadcastUIUpdate();
  }
  const observerMode = roomMode === RoomMode.Observer;
  const background = props.imageLoader.getBackgroundImage();

  // todo:
  React.useEffect(() => {
    audioService.playRoomBGM();
    window.addEventListener("beforeunload", () => disconnect());
    socket.on(GameEventIdentifiers.PlayerEnterRefusedEvent, () => {
      props.history.push("/lobby");
    });

    setupReconnection();
    presenter.setupRoomStatus({
      playerName: playerName,
      socket: socket,
      roomId: roomId,
      timestamp: Date.now(),
      playerId: playerId,
    });

    clientActiveListenerEvents().forEach((identifier: GameEventIdentifiers) => {
      socket.on(
        identifier,
        async (content: ServerEventFinder<GameEventIdentifiers>) => {
          const timestamp = EventPacker.getTimestamp(content);
          if (timestamp) {
            lastEventTimeStamp = timestamp;
          }

          if (identifier === GameEventIdentifiers.PlayerBulkPacketEvent) {
            await onHandleBulkEvents(
              (
                content as ServerEventFinder<GameEventIdentifiers.PlayerBulkPacketEvent>
              ).stackedLostMessages
            );
          } else {
            await gameProcessor.onHandleIncomingEvent(identifier, content);
            showMessageFromEvent(content);
            animation(identifier, content);
            updateGameStatus(content);
          }
        }
      );
    });

    return () => {
      disconnect();
      audioService.stop();
    };
  }, []);

  React.useEffect(() => {
    if (store.clientRoomInfo && !store.room) {
      /* todo: what is the time this UseEffect exec */
      socket.notify(
        GameEventIdentifiers.PlayerEnterEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.PlayerEnterEvent,
          {
            playerName: playerName,
            timestamp: store.clientRoomInfo!.timestamp,
            playerId: playerId!,
            coreVersion: Sanguosha.Version,
            joinAsObserver: roomMode === RoomMode.Observer,
          }
        )
      );
    }
  }, [store.clientRoomInfo, store.room]);

  return (
    <div className={styles.room} id="room">
      <Background image={background} />
      {store.selectorDialog}
      {store.selectorViewDialog}

      <div className={styles.incomingConversation}>
        {store.incomingConversation}
      </div>
      {store.room && (
        <div className={styles.roomBoard}>
          <Banner
            roomIndex={roomId}
            translator={props.translator}
            roomName={store.room.getRoomInfo().name}
            className={styles.roomBanner}
            connectionService={connectionService}
            onClickSettings={onClickSettings}
            onSwitchSideBoard={onSwitchSideBoard}
            defaultPing={roomPing}
            host={gameHostedServer}
          />
          <div className={styles.mainBoard}>
            <SeatsLayout
              imageLoader={props.imageLoader}
              store={store}
              presenter={presenter}
              skinData={props.skinData}
              translator={props.translator}
              onClick={store.onClickPlayer}
              playerSelectableMatcher={store.playersSelectionMatcher}
              onRequestView={onChangeObserver}
              observerMode={observerMode}
            />
            {renderSideBoard && (
              <div className={styles.sideBoard}>
                <GameBoard store={store} translator={props.translator} />
                <GameDialog
                  store={store}
                  presenter={presenter}
                  translator={props.translator}
                  connectionService={connectionService}
                  replayOrObserverMode={observerMode}
                />
              </div>
            )}
          </div>
          <Dashboard
            store={store}
            presenter={presenter}
            translator={props.translator}
            skinData={props.skinData}
            imageLoader={props.imageLoader}
            handcardHiddenMatcher={store.clientPlayerHandcardShowMatcher}
            cardEnableMatcher={store.clientPlayerCardActionsMatcher}
            outsideCardEnableMatcher={
              store.clientPlayerOutsideCardActionsMatcher
            }
            onClickConfirmButton={store.confirmButtonAction}
            onClickCancelButton={store.cancelButtonAction}
            onClickFinishButton={store.finishButtonAction}
            onClick={store.onClickHandCardToPlay}
            onClickEquipment={store.onClickEquipmentToDoAction}
            onClickPlayer={store.onClickPlayer}
            onTrusted={onTrusted}
            cardSkillEnableMatcher={store.cardSkillsSelectionMatcher}
            playerSelectableMatcher={store.playersSelectionMatcher}
            onClickSkill={store.onClickSkill}
            isSkillDisabled={store.isSkillDisabled}
            observerMode={observerMode}
          />
        </div>
      )}
      {openSettings && (
        <SettingsDialog
          defaultGameVolume={defaultGameVolume}
          defaultMainVolume={defaultMainVolume}
          imageLoader={props.imageLoader}
          translator={props.translator}
          onMainVolumeChange={settings.onMainVolumeChange}
          onGameVolumeChange={settings.onVolumeChange}
          onConfirm={onCloseSettings}
          electronLoader={props.electronLoader}
        />
      )}
    </div>
  );
}
