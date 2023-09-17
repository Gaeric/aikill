import { AudioLoader } from "audio_loader/audio_loader";
import { GameInfo } from "src/core/game/game_props";
import { RoomId } from "src/core/room/room";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { ImageLoader } from "src/image_loader/image_loader";
import { installAudioPlayerService } from "src/ui/audio/install";
import { RoomAvatarService } from "./services/avatar_service";
import { WaitingRoomSender } from "./services/sender_service";
import { WaitingRoomPresenter } from "./waiting_room.presenter";
import { WaitingRoomStore } from "./waiting_room.store";
import {
  WaitingRoomProcessor,
  WaitingRoomStoreType,
} from "./waiting_room_processor";

export function installServices(
  socket: SocketIOClient.Socket,
  translator: ClientTranslationModule,
  imageLoader: ImageLoader,
  audioLoader: AudioLoader,
  electronLoader: ElectronLoader,
  presenter: typeof WaitingRoomPresenter,
  store: WaitingRoomStoreType,
  selectedPlayerName: string,
  accessRejectedHandler: () => void,
  joinIntoTheGame: (roomId: RoomId, roomInfo: GameInfo) => void
) {
  const avatarService = new RoomAvatarService(imageLoader);
  return {
    avatarService,
    roomProcessorService: new WaitingRoomProcessor(
      socket,
      avatarService,
      translator,
      electronLoader,
      presenter,
      store,
      selectedPlayerName,
      accessRejectedHandler,
      joinIntoTheGame
    ),
    audioService: installAudioPlayerService(audioLoader, electronLoader),
    eventSenderService: new WaitingRoomSender(socket),
  };
}
