import { Player } from 'src/core/player/player';
import { ClientPlayer } from 'src/core/player/player.client';
import { ClientTranslationModule } from 'src/core/translations/translation_module.client';
import { ImageLoader } from 'src/image_loader/image_loader';

import { MoveCard } from 'src/pages/room/animations/move_card/move_card';
import { RoomPresenter } from 'src/pages/room/room.presenter';
import { RoomStore } from 'src/pages/room/room.store';
import * as React from 'react';
import { CharacterSkinInfo } from 'src/skins/skins';
import { Button } from 'src/ui/button/button';
import styles from './seats_layout.module.css';
import { PlayerCard } from '../player/player';

type SeatsLayoutProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  skinData?: CharacterSkinInfo[];
  onClick?(player: Player, selected: boolean): void;
  playerSelectableMatcher?(player?: Player): boolean;
  onRequestView?(player: Player): void;
  observerMode?: boolean;
};

export function SeatsLayout(props: SeatsLayoutProps) {
  const numberOfPlayers: number = props.store.room.Info.numberOfPlayers - 1;
  const sideNumberOfPlayers: number = Math.floor(numberOfPlayers / 3);
  const topNumberOfPlayers: number = numberOfPlayers - sideNumberOfPlayers * 2;

  const onClick = (player?: Player) => (selected: boolean) => {
    props.onClick && player && props.onClick(player, selected);
  };

  const onCloseIncomingMessage = (player: Player) => () => {
    props.presenter.onIncomingMessage(player.Id);
    // forceUpdate();
  };

  const ClientPlayerPosition = props.presenter.getClientPlayer()!.Position;

  function getLastPosition(position: number = ClientPlayerPosition) {
    return --position < 0 ? numberOfPlayers : position;
  }

  function getNextPosition(position: number = ClientPlayerPosition) {
    return ++position > numberOfPlayers ? 0 : position;
  }

  function getTopPlayerOffsetPosition() {
    const offset = ClientPlayerPosition + sideNumberOfPlayers + 1;
    if (offset > numberOfPlayers) {
      return offset - numberOfPlayers - 1;
    } else {
      return offset;
    }
  }

  const onRequestView = (player: Player) => () => {
    props.onRequestView?.(player);
  };

  const renderRequestViewButton = (player: Player) =>
    props.observerMode && (
      <Button variant="primary" onClick={() => onRequestView(player)} className={styles.observeButton}>
        {props.translator.tr('Observe')}
      </Button>
    );

  function getLeftPlayers() {
    let numberOfPlayers = sideNumberOfPlayers;
    const players: JSX.Element[] = [];
    if (ClientPlayerPosition === undefined) {
      return;
    }

    let playerIndex = getLastPosition();
    while (numberOfPlayers > 0) {
      const player = props.store.room.Players[playerIndex] as ClientPlayer | undefined;

      players.unshift(
        <div className={styles.playerCard}>
          <PlayerCard
            key={playerIndex}
            imageLoader={props.imageLoader}
            onClick={onClick(player)}
            skinData={props.skinData}
            delight={props.store.delightedPlayers !== undefined ? props.store.delightedPlayers : undefined}
            disabled={!props.playerSelectableMatcher || !props.playerSelectableMatcher(player)}
            store={props.store}
            player={player}
            translator={props.translator}
            presenter={props.presenter}
            playerPhase={props.store.room.CurrentPlayer === player ? props.store.room.CurrentPlayerPhase : undefined}
            actionTimeLimit={props.store.notificationTime}
            inAction={player !== undefined && props.store.notifiedPlayers.includes(player.Id)}
            incomingMessage={player && props.store.incomingUserMessages[player.Id]}
            onCloseIncomingMessage={player && onCloseIncomingMessage(player)}
            selected={props.store.selectedPlayers.includes(player!)}
          />
          {player && renderRequestViewButton(player)}
        </div>,
      );
      do {
        playerIndex = getLastPosition(playerIndex);
      } while (playerIndex === ClientPlayerPosition);
      numberOfPlayers--;
    }

    return players;
  }
  function getRightPlayers() {
    let numberOfPlayers = sideNumberOfPlayers;
    const players: JSX.Element[] = [];
    if (ClientPlayerPosition === undefined) {
      return;
    }

    let playerIndex = getNextPosition();
    while (numberOfPlayers > 0) {
      const player = props.store.room.Players[playerIndex] as ClientPlayer | undefined;
      players.unshift(
        <div className={styles.playerCard}>
          <PlayerCard
            key={playerIndex}
            imageLoader={props.imageLoader}
            onClick={onClick(player)}
            skinData={props.skinData}
            delight={props.store.delightedPlayers !== undefined ? props.store.delightedPlayers : undefined}
            disabled={!props.playerSelectableMatcher || !props.playerSelectableMatcher(player)}
            store={props.store}
            player={player}
            translator={props.translator}
            presenter={props.presenter}
            playerPhase={props.store.room.CurrentPlayer === player ? props.store.room.CurrentPlayerPhase : undefined}
            actionTimeLimit={props.store.notificationTime}
            inAction={player !== undefined && props.store.notifiedPlayers.includes(player.Id)}
            incomingMessage={player && props.store.incomingUserMessages[player.Id]}
            onCloseIncomingMessage={player && onCloseIncomingMessage(player)}
            selected={props.store.selectedPlayers.includes(player!)}
          />
          {player && renderRequestViewButton(player)}
        </div>,
      );
      do {
        playerIndex = getNextPosition(playerIndex);
      } while (playerIndex === ClientPlayerPosition);
      numberOfPlayers--;
    }
    return players;
  }

  function getTopPlayers() {
    let playerIndex = getTopPlayerOffsetPosition();
    const players: JSX.Element[] = [];

    let numberOfPlayers = topNumberOfPlayers;
    while (numberOfPlayers > 0) {
      const player = props.store.room.Players[playerIndex] as ClientPlayer | undefined;

      players.unshift(
        <div className={styles.playerCard}>
          <PlayerCard
            key={playerIndex}
            imageLoader={props.imageLoader}
            onClick={onClick(player)}
            delight={props.store.delightedPlayers !== undefined ? props.store.delightedPlayers : undefined}
            disabled={!props.playerSelectableMatcher || !props.playerSelectableMatcher(player)}
            store={props.store}
            player={player}
            skinData={props.skinData}
            translator={props.translator}
            presenter={props.presenter}
            playerPhase={props.store.room.CurrentPlayer === player ? props.store.room.CurrentPlayerPhase : undefined}
            actionTimeLimit={props.store.notificationTime}
            inAction={player !== undefined && props.store.notifiedPlayers.includes(player.Id)}
            incomingMessage={player && props.store.incomingUserMessages[player.Id]}
            onCloseIncomingMessage={player && onCloseIncomingMessage(player)}
            selected={props.store.selectedPlayers.includes(player!)}
          />
          {player && renderRequestViewButton(player)}
        </div>,
      );

      do {
        playerIndex = getNextPosition(playerIndex);
      } while (playerIndex === ClientPlayerPosition);
      numberOfPlayers--;
    }
    return players;
  }

  return (
    <div className={styles.seatsLayout}>
      <div className={styles.leftSeats}>{getLeftPlayers()}</div>
      <div className={styles.central}>
        <div className={styles.topSeats}>{getTopPlayers()}</div>
        <div className={styles.gamePad} id="gamePad">
          <MoveCard
            store={props.store}
            presenter={props.presenter}
            imageLoader={props.imageLoader}
            translator={props.translator}
          />
        </div>
      </div>
      <div className={styles.rightSeats}>{getRightPlayers()}</div>
    </div>
  );
}
