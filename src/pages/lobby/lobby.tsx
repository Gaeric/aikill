import logoImage from "src/assets/images/lobby/logo.png";
import { AudioLoader } from "audio_loader/audio_loader";
import classNames from "classnames";
import { Sanguosha } from "src/core/game/engine";
import { TemporaryRoomCreationInfo } from "src/core/game/game_props";
import { RoomMode } from "src/core/shares/types/room_props";
import { RoomInfo } from "src/core/shares/types/server_types";
import { TranslationPack } from "src/core/translations/translation_json_tool";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronData } from "src/electron_loader/electron_data";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { ImageLoader } from "src/image_loader/image_loader";
import { Background } from "src/pages/room/ui/background/background";
import { SettingsDialog } from "src/pages/ui/settings/settings";
import { ServerHostTag } from "src/props/config_props";
import { LobbyButton } from "src/props/game_props";
import { CampaignService } from "src/services/campaign_service/campaign_service";
import { ConnectionService } from "src/services/connection_service/connection_service";
import { PagePropsWithConfig } from "types/page_props";
import { installAudioPlayerService } from "src/ui/audio/install";
import { Button } from "src/ui/button/button";
import { LinkButton } from "src/ui/button/link_button";
import { Picture } from "src/ui/picture/picture";
import { SignalBar } from "src/ui/signal_bar/signal_bar";
import { Tooltip } from "src/ui/tooltip/tooltip";
import lockerImage from "./images/locked.png";
import styles from "./lobby.module.css";
import { Messages } from "./messages";
import { AcknowledgeDialog } from "./ui/acknowledge_dialog/acknowledge_dialog";
import { Chat } from "./ui/chat/chat";
import { CreateRoomButton } from "./ui/create_room_button/create_room_button";
import { CreateRoomDialog } from "./ui/create_room_dialog/create_room_dialog";
import { EnterPasscodeDialog } from "./ui/enter_passcode_dialog/enter_passcode_dialog";
import { FeedbackDialog } from "./ui/feedback_dialog/feedback_dialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LocalClientEmitter } from "src/core/network/local/local_emitter.client";
import { ClientSocket } from "src/core/network/socket.client";

type LobbyProps = PagePropsWithConfig<{
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  audioLoader: AudioLoader;
  electronLoader: ElectronLoader;
  connectionService: ConnectionService;
  campaignService: CampaignService;
}>;

type HostRoomInfo = {
  info: RoomInfo;
  host: ServerHostTag;
  ping: number;
};
const Lobby = (props: LobbyProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSettings, setOpenSettings] = useState(false);

  let roomList: { info: RoomInfo; host: ServerHostTag; ping: number }[] = [];

  let unmatchedCoreVersion = false;
  const [openRoomCreationDialog, setOpenRoomCreationDialog] = useState(false);
  const [openPasscodeEnterDialog, setOpenPasscodeEnterDialog] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [showPasscodeError, setShowPasscodeError] = useState(false);
  const [openAcknowledgement, setOpenAcknowledgement] = useState(false);
  const [username, setUserName] = useState("");
  let defaultMainVolume = 50;

  let defaultGameVolume = 50;

  let viewCharacterExtenstions: number | undefined;

  let updateTo: string;

  let updateComplete: boolean = false;

  let updateProgress: number = 0;

  let updateDownloadingFile: number = 1;

  let updateDownloadTotalFile: number = 1;

  const [gameLog, setGameLog] = useState<string>();
  let backgroundImage = props.imageLoader.getLobbyBackgroundImage();
  let illustrationImage = useRef(
    props.imageLoader.getRandomLobbyIllustration()
  ).current;
  let gameLogBoardImage = props.imageLoader.getGameLogBoradImage();
  let roomListBackgroundImage = props.imageLoader.getRoomListBackgroundImage();
  let audioService = installAudioPlayerService(
    props.audioLoader,
    props.electronLoader
  );
  let currentInteractiveRoomInfo: HostRoomInfo;
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

  useEffect(() => {
    queryRoomList();
    props.electronLoader.refreshReplayDataFlow();
    audioService.playLobbyBGM();
    defaultMainVolume = props.electronLoader.getData(ElectronData.MainVolume)
      ? Number.parseInt(
          props.electronLoader.getData(ElectronData.MainVolume),
          10
        )
      : 50;
    defaultGameVolume = props.electronLoader.getData(ElectronData.GameVolume)
      ? Number.parseInt(
          props.electronLoader.getData(ElectronData.GameVolume),
          10
        )
      : 50;
    setUserName(props.electronLoader.getData(ElectronData.PlayerName));

    props.electronLoader.saveTemporaryData(
      ElectronData.PlayerId,
      `${username}-${Date.now()}`
    );
    props.electronLoader.whenUpdate(
      (
        nextVersion: string,
        progress: number,
        totalFile: number,
        complete?: boolean,
        downloadingFile?: number
      ) => {
        updateTo = nextVersion;
        updateComplete = !!complete;
        updateProgress = progress;
        updateDownloadTotalFile = totalFile;
        updateDownloadingFile = downloadingFile || 1;
      }
    );

    props.electronLoader.getGameLog().then((inlineHtml: any) => {
      if (!inlineHtml) {
        setGameLog(inlineHtml);
      }
    });

    return () => {
      const excludedBgmStopList = ["/characters"];
      if (!excludedBgmStopList.includes(location.pathname)) {
        audioService.stop();
      }
    };
  }, []);

  function queryRoomList() {
    () => {
      roomList = [];
    };
    props.connectionService.Lobby.getRoomList((content) => {
      roomList.push(
        ...content.packet.map((RoomInfo) => ({
          info: roomInfo,
          host: content.hostTag,
          ping: content.ping,
        }))
      );
    });
  }
  function getUnmatchedHint() {
    return (
      unmatchedCoreVersion && (
        <div>{props.translator.tr(Messages.versionMismatch())}</div>
      )
    );
  }
  let RoomListTable = () => (
    <>
      {!unmatchedCoreVersion &&
        roomList.map((hostInfo, index) => (
          <li className={styles.roomInfo} key={hostInfo.info.id}>
            <span className={styles.roomName}>
              <span>{hostInfo.info.name}</span>
            </span>
            <span
              className={styles.roomMode}
              onMouseEnter={viewGameCharaterExtensions(index)}
              onMouseLeave={closeGameCharaterExtensions}
            >
              <Picture
                className={styles.gameModeIcon}
                image={props.imageLoader.getGameModeIcon(
                  hostInfo.info.gameMode
                )}
              />
              {viewCharacterExtenstions === index && (
                <Tooltip position={["slightBottom", "right"]}>
                  {hostInfo.info.packages
                    .map((p) => props.translator.tr(p))
                    .join(", ")}
                </Tooltip>
              )}
            </span>
            <span className={styles.roomStatus}>
              {props.translator.tr(hostInfo.info.status)}
            </span>
            <span
              className={styles.roomPlayers}
            >{`${hostInfo.info.activePlayers}/${hostInfo.info.totalPlayers}`}</span>
            <span className={styles.roomLocker}>
              {hostInfo.info.passcode && <img src={lockerImage} alt="" />}
            </span>
            <span className={styles.roomActions}>
              <LinkButton
                onClick={enterRoom(hostInfo)}
                disabled={
                  hostInfo.info.activePlayers === hostInfo.info.totalPlayers ||
                  !username ||
                  hostInfo.info.status === "playing"
                }
              >
                {props.translator.tr(Messages.join())}
              </LinkButton>
              {hostInfo.info.allowObserver &&
                hostInfo.info.status === "playing" && (
                  <LinkButton
                    onClick={enterRoomAsObserver(hostInfo)}
                    disabled={!username}
                  >
                    {props.translator.tr(Messages.observe())}
                  </LinkButton>
                )}
            </span>
            <SignalBar
              host={hostInfo.host}
              className={styles.signalBar}
              connectionService={props.connectionService}
            />
          </li>
        ))}
    </>
  );

  function createRoom(
    roomInfo: TemporaryRoomCreationInfo,
    roomName: string,
    passcode?: string
  ) {
    if (roomInfo.campaignMode) {
      props.campaignService.createRoom(
        props.config.flavor,
        roomInfo,
        (event) => {
          const { packet, ping, hostTag, error } = event;
          if (packet) {
            const { roomId, roomInfo: gameInfo } = packet;
            const hostConfig = props.config.host.find(
              (config) => config.hostTag === hostTag
            );
            let socket: ClientSocket = new LocalClientEmitter(
              (window as any).eventEmitter,
              roomId,
              new Date().getTime()
            );
            navigate(`/room/${roomId}`, {
              state: {
                gameMode: gameInfo.gameMode,
                ping,
                hostConfig,
                roomMode: RoomMode.Campaign,
                hostPlayerId: roomInfo.hostPlayerId,
                roomName,
                socket,
              },
            });
          } else {
            props.logger.error(error);
          }
        }
      );
    } else {
      props.connectionService.Lobby.createWaitingRoom(roomInfo, (event) => {
        const { packet, ping, hostTag, error } = event;
        if (packet && "roomId" in packet) {
          const { roomId, roomInfo } = packet;
          const hostConfig = props.config.host.find(
            (config) => config.hostTag === hostTag
          );
          navigate(`/waiting-room/${roomId}`, {
            roomInfo,
            ping,
            hostConfig,
          });
        } else {
          props.logger.error(error);
        }
      });
    }
  }

  function onCreateRoom() {
    if (unmatchedCoreVersion) {
      return;
    }
    setOpenRoomCreationDialog(true);
  }

  function onClickRefresh() {
    if (unmatchedCoreVersion) {
      return;
    }

    queryRoomList();
  }
  function enterRoom(hostInfo: HostRoomInfo) {
    console.log("enterRoom");

    const { info, host } = hostInfo;
    if (info.passcode) {
      setOpenPasscodeEnterDialog(true);

      currentInteractiveRoomInfo = hostInfo;
    } else {
      props.connectionService.Lobby.checkRoomExist(
        host,
        info.id,
        (exist, ping) => {
          if (exist) {
            navigate(`/waiting-room/${info.id}`, {
              ping,
              hostConfig: props.config.host.find(
                (config) => config.hostTag === host
              ),
            });
          } else {
            //TODO: add error popout
            () => {
              const deadRoomIndex = roomList.findIndex(
                (roomHostInfo) =>
                  roomHostInfo.info.id === currentInteractiveRoomInfo.info.id
              );
              if (deadRoomIndex >= 0) {
                roomList.splice(deadRoomIndex, 1);
              }
            };
          }
        }
      );
    }
  }

  function enterRoomAsObserver(hostInfo: HostRoomInfo) {
    const { info, host } = hostInfo;
    props.connectionService.Lobby.checkRoomExist(
      host,
      info.id,
      (exist, ping) => {
        if (exist) {
          navigate(`/room/${info.id}`, {
            ping,
            hostConfig: props.config.host.find(
              (config) => config.hostTag === host
            ),
            roomMode: RoomMode.Observer,
          });
        } else {
          //TODO: add error popout
          () => {
            const deadRoomIndex = roomList.findIndex(
              (roomHostInfo) =>
                roomHostInfo.info.id === currentInteractiveRoomInfo.info.id
            );
            if (deadRoomIndex >= 0) {
              roomList.splice(deadRoomIndex, 1);
            }
          };
        }
      }
    );
  }

  function onRoomCreated(
    roomInfo: TemporaryRoomCreationInfo,
    roomName: string,
    passcode?: string
  ) {
    setOpenRoomCreationDialog(false);
    createRoom(roomInfo, roomName, passcode);
  }

  function onRoomCreationCancelled() {
    setOpenRoomCreationDialog(false);
  }

  function onClickSettings() {
    setOpenSettings(true);
  }

  function onClickCharactersList() {
    navigate("/characters");
  }

  function onCloseSettings() {
    setUserName(props.electronLoader.getData(ElectronData.PlayerName));
    setOpenSettings(false);
  }

  function onOpenAcknowledgement() {
    setOpenAcknowledgement(true);
  }

  function onCloseAcknowledgement() {
    setOpenAcknowledgement(false);
  }

  function onPasscodeSubmit(passcode?: string) {
    if (
      currentInteractiveRoomInfo &&
      passcode &&
      currentInteractiveRoomInfo.info.passcode === passcode
    ) {
      setOpenPasscodeEnterDialog(false);

      setShowPasscodeError(false);
      props.connectionService.Lobby.checkRoomExist(
        currentInteractiveRoomInfo.host,
        currentInteractiveRoomInfo.info.id,
        (exist) => {
          if (exist) {
            navigate(`/waiting-room/${currentInteractiveRoomInfo.info.id}`, {
              hostConfig: props.config.host.find(
                (config) => config.hostTag === currentInteractiveRoomInfo.host
              ),
            });
          } else {
            //TODO: add error popout
            () => {
              const deadRoomIndex = roomList.findIndex(
                (roomHostInfo) =>
                  roomHostInfo.info.id === currentInteractiveRoomInfo.info.id
              );
              if (deadRoomIndex >= 0) {
                roomList.splice(deadRoomIndex, 1);
              }
            };
          }
        }
      );
    } else {
      setShowPasscodeError(true);
    }
  }

  function onPasscodeDialogClose() {
    setOpenPasscodeEnterDialog(false);

    setShowPasscodeError(false);
  }

  function onOpenFeedback() {
    setOpenFeedback(true);
  }

  function onFeedbackDialogClose() {
    setOpenFeedback(false);
  }

  function viewGameCharaterExtensions(index: number) {
    viewCharacterExtenstions = index;
  }

  function closeGameCharaterExtensions() {
    viewCharacterExtenstions = undefined;
  }

  function onOpenReplay() {
    props.electronLoader.readReplay(Sanguosha.Version).then((replay) => {
      if (!replay) {
        return;
      }
      navigate("/replay", { replayData: replay });
    });
  }
  return (
    <div className={styles.lobby}>
      <Background image={backgroundImage} />
      <div className={styles.board}>
        <div className={styles.functionBoard}>
          <div className={styles.illustration}>
            <Picture image={illustrationImage} />
            <img className={styles.logo} src={logoImage} alt={"logo"} />
          </div>
          <div className={styles.gameLog}>
            <div className={styles.gameLogContainer}>
              <Picture
                className={styles.gameLogBoardImage}
                image={gameLogBoardImage}
              />
              <p
                className={styles.gameLogText}
                dangerouslySetInnerHTML={{ __html: gameLog }}
              />
            </div>
          </div>
          <Button
            variant="primary"
            className={styles.button}
            onClick={onClickRefresh}
            disabled={unmatchedCoreVersion}
          >
            {props.translator.tr(Messages.refreshRoom())}
          </Button>
        </div>
        <div
          className={classNames(styles.roomList, {
            [styles.unavailable]: !username,
          })}
        >
          {roomList.length === 0 && (
            <span>{props.translator.tr(Messages.noRoomsAvailable())}</span>
          )}
          {getUnmatchedHint()}
          <RoomListTable />
          <CreateRoomButton
            imageLoader={props.imageLoader}
            onClick={onCreateRoom}
            className={styles.createRoomButton}
            disabled={!username || unmatchedCoreVersion}
          />
          <Picture
            image={roomListBackgroundImage}
            className={styles.roomListBackground}
          />
        </div>
        <div className={styles.systemButtons}>
          <button
            className={styles.systemButton}
            onClick={onOpenReplay}
            disabled={!props.electronLoader.ReplayEnabled}
          >
            <Picture
              image={props.imageLoader.getLobbyButtonImage(LobbyButton.Record)}
              className={styles.lobbyButtonIcon}
            />
          </button>
          <button
            className={styles.systemButton}
            onClick={onClickCharactersList}
          >
            <Picture
              image={props.imageLoader.getLobbyButtonImage(
                LobbyButton.CharactersList
              )}
              className={styles.lobbyButtonIcon}
            />
          </button>
          <button
            className={styles.systemButton}
            onClick={(e) => onClickSettings()}
          >
            {!username && (
              <Tooltip autoAnimation position={["top"]}>
                {props.translator.tr(Messages.usernamePlaceholder())}
              </Tooltip>
            )}
            <Picture
              image={props.imageLoader.getLobbyButtonImage(
                LobbyButton.Settings
              )}
              className={styles.lobbyButtonIcon}
            />
          </button>
          <button className={styles.systemButton} onClick={onOpenFeedback}>
            <Picture
              image={props.imageLoader.getLobbyButtonImage(
                LobbyButton.Feedback
              )}
              className={styles.lobbyButtonIcon}
            />
          </button>
          <button
            className={styles.systemButton}
            onClick={onOpenAcknowledgement}
          >
            <Picture
              image={props.imageLoader.getLobbyButtonImage(
                LobbyButton.Acknowledgement
              )}
              className={styles.lobbyButtonIcon}
            />
          </button>
        </div>
      </div>
      <div className={styles.chatInfo}></div>
      {openRoomCreationDialog && (
        <CreateRoomDialog
          imageLoader={props.imageLoader}
          translator={props.translator}
          electronLoader={props.electronLoader}
          playerName={username}
          onSubmit={onRoomCreated}
          onCancel={onRoomCreationCancelled}
        />
      )}
      {openSettings && (
        <SettingsDialog
          electronLoader={props.electronLoader}
          defaultGameVolume={defaultGameVolume}
          defaultMainVolume={defaultMainVolume}
          imageLoader={props.imageLoader}
          translator={props.translator}
          onMainVolumeChange={settings.onMainVolumeChange}
          onGameVolumeChange={settings.onVolumeChange}
          onConfirm={() => onCloseSettings()}
        />
      )}
      {openPasscodeEnterDialog && (
        <EnterPasscodeDialog
          translator={props.translator}
          imageLoader={props.imageLoader}
          onSubmit={onPasscodeSubmit}
          onClose={onPasscodeDialogClose}
          showError={showPasscodeError}
        />
      )}
      {openFeedback && (
        <FeedbackDialog
          imageLoader={props.imageLoader}
          onClose={() => onFeedbackDialogClose()}
        />
      )}
      {openAcknowledgement && (
        <AcknowledgeDialog
          imageLoader={props.imageLoader}
          onClose={onCloseAcknowledgement}
        />
      )}
      <div className={styles.version}>
        {updateTo && !updateComplete && (
          <span>
            {props.translator.trx(
              TranslationPack.translationJsonPatcher(
                Messages.updating(),
                updateTo
              ).toString()
            )}
            {props.translator.trx(
              TranslationPack.translationJsonPatcher(
                Messages.downloadingPatch(),
                updateDownloadingFile,
                updateDownloadTotalFile
              ).toString()
            )}
            {(updateProgress * 100).toFixed(2)} %
          </span>
        )}
        {updateComplete && (
          <span>{props.translator.tr(Messages.updateComplete())}</span>
        )}
        {props.translator.trx(
          TranslationPack.translationJsonPatcher(
            "/src/core version: {0}",
            Sanguosha.Version
          ).toString()
        )}
      </div>
    </div>
  );
};

export default Lobby;
