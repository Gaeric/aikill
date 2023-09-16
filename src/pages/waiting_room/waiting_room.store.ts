import { WaitingRoomGameSettings } from '/src/core/game/game_props';
import { PlayerId } from '/src/core/player/player_props';
import * as mobx from 'mobx';
import { ChatPacketObject } from '/src/services/connection_service/connection_service';

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

export class WaitingRoomStore {
  constructor(public readonly selfPlayerId: PlayerId) {}

  @mobx.observable.deep
  gameSettings: WaitingRoomGameSettings = {} as any;

  @mobx.observable.shallow
  seats: WaitingRoomSeatInfo[] = [];

  @mobx.observable.shallow
  chatMessages: ChatPacketObject[] = [];
}
