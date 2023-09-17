import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { GameInfo } from 'src/core/game/game_props';
import { PlayerId } from 'src/core/player/player_props';
import { RoomId } from 'src/core/room/room';

export type ReplayPlayerInfo = {
  Id: PlayerId;
  Name: string;
  Position: number;
};

export type ReplayDataType = {
  gameInfo: GameInfo;
  playersInfo: ReplayPlayerInfo[];
  roomId: RoomId;
  viewerId: PlayerId;
  viewerName: string;
  version: string;
  events: ServerEventFinder<GameEventIdentifiers>[];
};
