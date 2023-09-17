import { Sanguosha } from "src/core/game/engine";
import { WaitingRoomGameSettings } from "src/core/game/game_props";
import { PlayerId } from "src/core/player/player_props";
import { GameMode } from "src/core/shares/types/room_props";
import { ChatPacketObject } from "src/services/connection_service/connection_service";
import { useState } from "react";

export type WaitingRoomStoreType = {
  gameSettings: any;
  seats: WaitingRoomSeatInfo[];
  chatMessages: ChatPacketObject[];
  selfPlayerId: PlayerId;
};

export type WaitingRoomSeatInfo = { seatId: number } & (
  | {
      playerName?: string;
      playerId?: string;
      playerAvatarId?: number;
      playerReady?: boolean;
      seatDisabled: false;
    }
  | { seatDisabled: true }
);

export function WaitingRoomPresenter() {
  let selfPlayerId;
  const [gameSettings, setGameSettings] = useState<WaitingRoomGameSettings>();
  const [seats, setSeats] = useState<WaitingRoomSeatInfo[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatPacketObject[]>([]);
  const store = {
    gameSettings,
    seats,
    chatMessages,
    selfPlayerId,
  };

  const defaultNumberOfPlayers = 8;

  function createStore(
    playerId: PlayerId,
    defaultSettings?: WaitingRoomGameSettings
  ) {
    selfPlayerId = playerId;
    initGameSettings(defaultSettings);
    return store;
  }

  function initGameSettings(defaultSettings?: WaitingRoomGameSettings) {
    setGameSettings(
      () =>
        ({
          gameMode: GameMode.Standard,
          cardExtensions: Sanguosha.getCardExtensionsFromGameMode(
            GameMode.Standard
          ),
          characterExtensions: Sanguosha.getGameCharacterExtensions(),
          excludedCharacters: [],
          numberOfPlayers: defaultNumberOfPlayers,
          playingTimeLimit: 60,
          wuxiekejiTimeLimit: 15,
          allowObserver: false,
          pveNumberOfPlayers: 3,
          ...defaultSettings,
        } as WaitingRoomGameSettings)
    );

    setChatMessages(() => []);
  }

  function updateGameSettings(
    newGameSettings: Partial<WaitingRoomGameSettings>
  ) {
    setGameSettings(() => newGameSettings as WaitingRoomGameSettings);
  }

  function updateSeatInfo(seatInfo: WaitingRoomSeatInfo) {
    setSeats(() => {
      for (let i = 0; i < store.seats.length; i++) {
        if (store.seats[i].seatId === seatInfo.seatId) {
          store.seats[i] = JSON.parse(JSON.stringify(seatInfo));
          break;
        }
      }
      return seats;
    });
  }

  function updateRoomPlayers(addPlayers: number) {
    setGameSettings(() => {
      gameSettings!.numberOfPlayers += addPlayers;
      return gameSettings;
    });
  }

  function disableSeat(seatId: number) {
    setSeats((seats) => {
      const seat = seats.find((s) => s.seatId === seatId);
      if (seat) {
        seat.seatDisabled = true;
      }
      return seats;
    });
  }

  function initSeatsInfo(seatsInfo?: WaitingRoomSeatInfo[]) {
    if (seatsInfo) {
      setSeats(() => {
        const newSeats: WaitingRoomSeatInfo[] = [];
        for (let i = 0; i < seats.length; i++) {
          const seat = seatsInfo.find((s) => s.seatId === i);
          newSeats.push(seat || seats[i]);
        }
        return newSeats;
      });
    } else {
      for (let i = 0; i < defaultNumberOfPlayers; i++) {
        setSeats((seats) => [
          ...seats,
          {
            seatDisabled: gameSettings!.numberOfPlayers - i > 0 ? false : true,
            seatId: i,
          },
        ]);
      }
    }
  }
  function sendChatMessage(message: ChatPacketObject) {
    setChatMessages((chatMessages) => [...chatMessages, message]);
  }
  return {
    defaultNumberOfPlayers,
    store,
    createStore,
    updateGameSettings,
    updateSeatInfo,
    updateRoomPlayers,
    disableSeat,
    initSeatsInfo,
    sendChatMessage,
  };
}
