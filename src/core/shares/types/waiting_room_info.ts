import { WaitingRoomEvent, WaitingRoomServerEventFinder } from '/src/core/event/event';
import { TemporaryRoomCreationInfo } from '/src/core/game/game_props';
import { PlayerId } from '/src/core/player/player_props';
import { RoomId } from '/src/core/room/room';

export type WaitingRoomInfo = {
  roomId: RoomId;
  roomInfo: TemporaryRoomCreationInfo;
  players: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>['otherPlayersInfo'];
  closedSeats: number[];
  hostPlayerId: PlayerId;
  isPlaying: boolean;
};
