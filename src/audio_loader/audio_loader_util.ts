import { Precondition } from "src/core/shares/libs/precondition/precondition";
import { ClientFlavor } from "src/props/config_props";
import { DevAudioLoader } from "./dev_audio_loader";

export function getAudioLoader(flavor: ClientFlavor) {
  switch (flavor) {
    case ClientFlavor.Web:
    case ClientFlavor.Dev:
    case ClientFlavor.Desktop:
    case ClientFlavor.Mobile:
      return new DevAudioLoader();
    case ClientFlavor.Tauri:
      // todo
      return new Error("Prod loader not ready");
    default:
      throw Precondition.UnreachableError(flavor);
  }
}
