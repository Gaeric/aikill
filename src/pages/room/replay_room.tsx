import { AudioLoader } from "audio_loader/audio_loader";
import { GameEventIdentifiers, ServerEventFinder } from "src/core/event/event";
import { EventPacker } from "src/core/event/event_packer";
import { ClientOfflineSocket } from "src/core/network/socket.offline";
import { PlayerInfo } from "src/core/player/player_props";
import { System } from "src/core/shares/libs/system";
import { TranslationPack } from "src/core/translations/translation_json_tool";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronData } from "src/electron_loader/electron_data";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { ImageLoader } from "src/image_loader/image_loader";
import { SettingsDialog } from "src/pages/ui/settings/settings";
import { ServerHostTag } from "src/props/config_props";
import * as React from "react";
import { ConnectionService } from "src/services/connection_service/connection_service";
import { CharacterSkinInfo } from "src/skins/skins";
import { PagePropsWithConfig } from "src/types/page_props";
import { ReplayDataType } from "src/types/replay_props";
import { installAudioPlayerService } from "src/ui/audio/install";
import { ReplayClientProcessor } from "./game_processor.replay";
import { installService, RoomBaseService } from "./install_service";
import styles from "./room.module.css";
import { RoomPresenter } from "./room.presenter";
import { Background } from "./ui/background/background";
import { Banner } from "./ui/banner/banner";
import { Dashboard } from "./ui/dashboard/dashboard";
import { GameDialog } from "./ui/game_dialog/game_dialog";
import { GameBoard } from "./ui/gameboard/gameboard";
import { SeatsLayout } from "./ui/seats_layout/seats_layout";

export function ReplayRoomPage(props: PagePropsWithConfig) {
  let presenter = RoomPresenter(props.imageLoader).newRoomPresent;
  let store = presenter.store;
  let gameProcessor: ReplayClientProcessor;
  let baseService: RoomBaseService;
  let audioService = installAudioPlayerService(
    props.audioLoader,
    props.electronLoader
  );

  let replayStepDelay = 2000;
  let dumped = false;

  let [openSettings, setOpenSettings] = React.useState(false);
  let [renderSideBoard, setRenderSideBoard] = React.useState(true);

  let defaultMainVolume = props.electronLoader.getData(ElectronData.MainVolume)
    ? Number.parseInt(props.electronLoader.getData(ElectronData.MainVolume), 10)
    : 50;

  let defaultGameVolume = props.electronLoader.getData(ElectronData.GameVolume)
    ? Number.parseInt(props.electronLoader.getData(ElectronData.GameVolume), 10)
    : 50;

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

  const { translator } = props;

  baseService = installService(props.translator, store, props.imageLoader);
  gameProcessor = new ReplayClientProcessor(
    presenter,
    store,
    translator,
    props.imageLoader,
    audioService,
    props.electronLoader,
    props.skinData
  );

  let nonDelayedEvents: GameEventIdentifiers[] = [
    GameEventIdentifiers.PhaseChangeEvent,
    GameEventIdentifiers.PhaseStageChangeEvent,
    GameEventIdentifiers.PlayerBulkPacketEvent,
    GameEventIdentifiers.PlayerBulkPacketEvent,
    GameEventIdentifiers.MoveCardEvent,
    GameEventIdentifiers.DrawCardEvent,
    GameEventIdentifiers.DrunkEvent,
    GameEventIdentifiers.HpChangeEvent,
    GameEventIdentifiers.ChangeMaxHpEvent,
    GameEventIdentifiers.PlayerPropertiesChangeEvent,
    GameEventIdentifiers.ObtainSkillEvent,
    GameEventIdentifiers.LoseSkillEvent,
    GameEventIdentifiers.LoseHpEvent,
    GameEventIdentifiers.DamageEvent,
    GameEventIdentifiers.CustomGameDialog,
    GameEventIdentifiers.NotifyEvent,
    GameEventIdentifiers.UserMessageEvent,
    GameEventIdentifiers.HookUpSkillsEvent,
    GameEventIdentifiers.UnhookSkillsEvent,
  ];

  async function stepDelay(identifier: GameEventIdentifiers) {
    if (ReplayRoomPage.nonDelayedEvents.includes(identifier)) {
      await System.MainThread.sleep(0);
    } else {
      await System.MainThread.sleep(replayStepDelay);
    }
  }

  async function loadSteps(events: ServerEventFinder<GameEventIdentifiers>[]) {
    for (const content of events) {
      if (dumped) {
        break;
      }
      const identifier = EventPacker.getIdentifier(content)!;
      if (identifier === undefined) {
        // tslint:disable-next-line:no-console
        console.warn(`missing identifier: ${JSON.stringify(content, null, 2)}`);
        continue;
      }
      if (identifier === GameEventIdentifiers.PlayerBulkPacketEvent) {
        const { stackedLostMessages } =
          content as ServerEventFinder<GameEventIdentifiers.PlayerBulkPacketEvent>;
        await loadSteps(stackedLostMessages);
      } else {
        await gameProcessor.onHandleIncomingEvent(identifier, content);
        showMessageFromEvent(content);
        animation(identifier, content);
        updateGameStatus(content);
        await stepDelay(identifier);
      }
    }
  }

  React.useEffect(() => {
    audioService.playRoomBGM();
    const { replayData } = props.location.state as {
      replayData: ReplayDataType;
    };
    if (!replayData) {
      props.history.push("/lobby");
    }
    console.log("replay room's createClientRoom");
    presenter.setupClientPlayerId(replayData.viewerId);
    presenter.createClientRoom(
      replayData.roomId,
      new ClientOfflineSocket(replayData.roomId.toString()),
      replayData.gameInfo,
      replayData.playersInfo as PlayerInfo[]
    );
    props.translator.setupPlayer(presenter.getClientPlayer());
    store.animationPosition.insertPlayer(replayData.viewerId);

    loadSteps(replayData.events);
    return () => {
      dumped = true;
      audioService.stop();
    };
  }, []);

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
  }

  function showMessageFromEvent(
    event: ServerEventFinder<GameEventIdentifiers>
  ) {
    const {
      messages = [],
      translationsMessage,
      unengagedMessage,
      engagedPlayerIds,
    } = event;
    const { translator } = props;

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
      presenter.addGameLog(translator.trx(message));
    });
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

  const { replayData } = props.location.state as {
    replayData: ReplayDataType;
  };
  const background = props.imageLoader.getBackgroundImage();

  return (
    <div className={styles.room}>
      <Background image={background} />
      {store.selectorDialog}

      <div className={styles.incomingConversation}>
        {store.incomingConversation}
      </div>
      {store.room && (
        <div className={styles.roomBoard}>
          <Banner
            roomIndex={replayData.roomId}
            translator={props.translator}
            roomName={store.room.getRoomInfo().name}
            className={styles.roomBanner}
            connectionService={props.connectionService}
            onClickSettings={onClickSettings}
            onSwitchSideBoard={onSwitchSideBoard}
            host={ServerHostTag.Localhost}
          />
          <div className={styles.mainBoard}>
            <SeatsLayout
              imageLoader={props.imageLoader}
              store={store}
              skinData={props.skinData}
              presenter={presenter}
              translator={props.translator}
            />
            {renderSideBoard && (
              <div className={styles.sideBoard}>
                <GameBoard store={store} translator={props.translator} />
                <GameDialog
                  store={store}
                  presenter={presenter}
                  translator={props.translator}
                  replayOrObserverMode={true}
                  connectionService={props.connectionService}
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
            onClick={store.onClickHandCardToPlay}
            isSkillDisabled={store.isSkillDisabled}
            observerMode={false}
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
