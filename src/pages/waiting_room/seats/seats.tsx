import classNames from "classnames";
import { Sanguosha } from "src/core/game/engine";
import { PlayerId } from "src/core/player/player_props";
import { GameMode } from "src/core/shares/types/room_props";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { Button } from "src/ui/button/button";
import { Picture } from "src/ui/picture/picture";
import { Messages } from "./messages";
import styles from "./seats.module.css";
import { RoomAvatarService } from "../services/avatar_service";
import { WaitingRoomSender } from "../services/sender_service";
import { StatusBadge } from "../status_badge/status_badge";
import {
  WaitingRoomPresenter,
  WaitingRoomStoreType,
  WaitingRoomSeatInfo,
} from "../waiting_room.presenter";

export type SeatsProps = {
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  presenter: typeof WaitingRoomPresenter;
  store: WaitingRoomStoreType;
  avatarService: RoomAvatarService;
  senderService: WaitingRoomSender;
  className?: string;
  validToStartGame: boolean;
  isHost: boolean;
  hostPlayerId: PlayerId;
  roomName: string;
};

function ClickableSeat(props: {
  imageLoader: ImageLoader;
  seatInfo: WaitingRoomSeatInfo;
  avatarService: RoomAvatarService;
  translator: ClientTranslationModule;
  onClick(closeSeat: boolean, seatId: number, kickedPlayerId?: string): void;
  selfPlayerId: PlayerId;
  clickable: boolean;
}) {
  const [characterAvatar, setCharacterAvatar] = React.useState(
    props.imageLoader.getEmptySeatImage()
  );
  let onClick = () => {
    if (!props.clickable) {
      return;
    }

    props.onClick(
      !props.seatInfo.seatDisabled,
      props.seatInfo.seatId,
      !props.seatInfo.seatDisabled ? props.seatInfo.playerId : undefined
    );
  };

  async function doPlayersUpdate() {
    if (!props.seatInfo.seatDisabled && props.seatInfo.playerAvatarId) {
      const latestAvatar = await props.avatarService.getAvatarByIndex(
        props.seatInfo.playerAvatarId
      );
      if (characterAvatar.src !== latestAvatar.src) {
        setCharacterAvatar(latestAvatar);
      }
    } else {
      const latestAvatar = props.imageLoader.getEmptySeatImage();
      if (characterAvatar.src !== latestAvatar.src) {
        setCharacterAvatar(latestAvatar);
      }
    }
  }

  React.useEffect(() => {
    doPlayersUpdate();
  }, []);

  return (
    <span
      className={classNames(styles.seat, {
        [styles.clickable]: props.clickable,
      })}
      onClick={onClick}
    >
      {!props.seatInfo.seatDisabled && (
        <span className={styles.playerName}>{props.seatInfo.playerName}</span>
      )}
      <Picture
        image={characterAvatar}
        className={classNames(styles.seatImage, {
          [styles.seatClosed]: props.seatInfo.seatDisabled,
        })}
      />
      {!props.seatInfo.seatDisabled && props.seatInfo.playerReady && (
        <StatusBadge
          className={styles.userGetReady}
          text={props.translator.tr(Messages.ready())}
        />
      )}
    </span>
  );
}

export function Seats(props: SeatsProps) {
  const [isReady, setIsReady] = React.useState(false);

  let onClickSeat = (
    closeSeat: boolean,
    seatId: number,
    kickedPlayerId?: PlayerId
  ) => {
    if (props.store.selfPlayerId === kickedPlayerId || !props.isHost) {
      return;
    }

    props.senderService.kickPlayerOrCloseSeat(
      seatId,
      closeSeat,
      kickedPlayerId
    );
  };

  // 原get
  function isEveryoneReady() {
    return props.store.seats.every((seat) =>
      seat.seatDisabled || seat.playerId == null ? true : seat.playerReady
    );
  }
  // 原get
  function countPlayers() {
    if (props.store.gameSettings.gameMode === GameMode.Pve) {
      return props.store.gameSettings.pveNumberOfPlayers;
    }

    return props.store.seats.filter(
      (seat) => !seat.seatDisabled && seat.playerId != null
    ).length;
  }

  let transferHost = (playerId: PlayerId) => () => {
    props.senderService.giveHostTo(props.store.selfPlayerId, playerId);
  };

  let createSeats = () => {
    const seatComponents: JSX.Element[] = [];
    for (const seat of props.store.seats) {
      const hostControl =
        props.isHost && props.store.selfPlayerId !== (seat as any).playerId;
      seatComponents.push(
        <span className={styles.seatComponent} key={seat.seatId}>
          {hostControl && (seat as any).playerId && (
            <Button
              variant="primary"
              onClick={transferHost((seat as any).playerId)}
              className={styles.giveHostButton}
            >
              {props.translator.tr(Messages.transferHost())}
            </Button>
          )}
          <ClickableSeat
            imageLoader={props.imageLoader}
            seatInfo={seat}
            translator={props.translator}
            avatarService={props.avatarService}
            selfPlayerId={props.store.selfPlayerId}
            onClick={onClickSeat}
            clickable={hostControl}
          />
        </span>
      );
    }

    return seatComponents;
  };

  let getReady = () => {
    setIsReady(!isReady);
    props.senderService.getReady(props.store.selfPlayerId, isReady);
  };

  let requestGameStart = () => {
    let gameMode = props.store.gameSettings.gameMode;
    if (
      props.store.gameSettings.gameMode === GameMode.Pve &&
      props.store.gameSettings.pveNumberOfPlayers === 5
    ) {
      gameMode = GameMode.PveClassic;
    }

    props.senderService.requestGameStart({
      ...props.store.gameSettings,
      numberOfPlayers: countPlayers,
      roomName: props.roomName,
      coreVersion: Sanguosha.Version,
      campaignMode: false,
      gameMode,
    });
  };

  function renderPlayerControlButton() {
    if (props.isHost) {
      const selfSeat = props.store.seats.find(
        (s) => !s.seatDisabled && s.playerId === props.store.selfPlayerId
      );
      if (selfSeat && !selfSeat.seatDisabled && !selfSeat.playerReady) {
        return (
          <Button
            className={styles.startButton}
            variant="primary"
            onClick={getReady}
          >
            {props.translator.tr(Messages.getReady())}
          </Button>
        );
      }

      return (
        <Button
          className={styles.startButton}
          variant="primary"
          onClick={requestGameStart}
          disabled={!isEveryoneReady || !props.validToStartGame}
        >
          {props.translator.tr(Messages.gameStart())}
        </Button>
      );
    } else {
      return (
        <Button
          className={styles.startButton}
          variant="primary"
          onClick={getReady}
        >
          {isReady
            ? props.translator.tr(Messages.cancelReady())
            : props.translator.tr(Messages.getReady())}
        </Button>
      );
    }
  }

  return (
    <div className={classNames(styles.conainer, props.className)}>
      {createSeats()}
      {renderPlayerControlButton()}
    </div>
  );
}
