import { GameProcessor } from "src/core/game/game_processor/game_processor";
import { OneVersusTwoGameProcessor } from "src/core/game/game_processor/game_processor.1v2";
import { TwoVersusTwoGameProcessor } from "src/core/game/game_processor/game_processor.2v2";
import { PveClassicGameProcessor } from "src/core/game/game_processor/game_processor.pve_classic";
import { PveLongshenGameProcessor } from "src/core/game/game_processor/game_processor.pve_longshen";
import { StandardGameProcessor } from "src/core/game/game_processor/game_processor.standard";
import { GameCardExtensions } from "src/core/game/game_props";
import { TemporaryRoomCreationInfo } from "src/core/game/game_props";
import { GameCommonRules } from "src/core/game/game_rules";
import { RecordAnalytics } from "src/core/game/record_analytics";
import { StageProcessor } from "src/core/game/stage_processor";
import { LocalServerEmitter } from "src/core/network/local/local_emitter.server";
import { ServerSocket } from "src/core/network/socket.server";
import { ServerRoom } from "src/core/room/room.server";
import { RoomEventStacker } from "src/core/room/utils/room_event_stack";
import { Logger } from "src/core/shares/libs/logger/logger";
import { Flavor } from "src/core/shares/types/host_config";
import { GameMode } from "src/core/shares/types/room_props";
import { ClientFlavor, ServerHostTag } from "src/props/config_props";
import { CreateGameListenerResponse } from "src/services/connection_service/connection_service";

export class CampaignService {
  private campaginRooms: {
    [K: string]: ServerRoom;
  } = {};
  constructor(private logger: Logger, private flavor: ClientFlavor) {}

  private readonly createDifferentModeGameProcessor = (
    roomInfo: {
      cardExtensions: GameCardExtensions[];
    } & TemporaryRoomCreationInfo
  ): GameProcessor => {
    switch (roomInfo.gameMode) {
      case GameMode.Pve:
        return new PveLongshenGameProcessor(
          new StageProcessor(this.logger),
          this.logger
        );
      case GameMode.PveClassic:
        return new PveClassicGameProcessor(
          new StageProcessor(this.logger),
          this.logger
        );
      case GameMode.OneVersusTwo:
        return new OneVersusTwoGameProcessor(
          new StageProcessor(this.logger),
          this.logger
        );
      case GameMode.TwoVersusTwo:
        return new TwoVersusTwoGameProcessor(
          new StageProcessor(this.logger),
          this.logger
        );
      case GameMode.Standard:
      default:
        return new StandardGameProcessor(
          new StageProcessor(this.logger),
          this.logger
        );
    }
  };

  createRoom(
    flavor: ClientFlavor,
    roomInfo: TemporaryRoomCreationInfo,
    callback: (evt: CreateGameListenerResponse) => void
  ) {
    const roomId = Date.now();
    const socket = new LocalServerEmitter(
      (window as any).eventEmitter,
      this.logger
    );
    const room = new ServerRoom(
      roomId,
      {
        ...roomInfo,
        campaignMode: !!roomInfo.campaignMode,
        flavor: this.flavor === ClientFlavor.Dev ? Flavor.Dev : Flavor.Prod,
      },
      socket as unknown as ServerSocket,
      this.createDifferentModeGameProcessor(roomInfo),
      new RecordAnalytics(),
      [],
      this.flavor === ClientFlavor.Dev ? Flavor.Dev : Flavor.Prod,
      this.logger,
      roomInfo.gameMode,
      new GameCommonRules(),
      new RoomEventStacker(),
      { roomInfo, roomId: 1 }
    );
    this.campaginRooms[roomId] = room;

    room.onClosed(() => {
      delete this.campaginRooms[roomId];
    });

    callback({
      packet: {
        roomId,
        roomInfo: {
          ...roomInfo,
          campaignMode: !!roomInfo.campaignMode,
          flavor: this.flavor === ClientFlavor.Dev ? Flavor.Dev : Flavor.Prod,
        },
      },
      hostTag: ServerHostTag.Localhost,
      ping: 0,
    });
  }
}
