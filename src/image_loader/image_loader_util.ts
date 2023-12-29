import { Precondition } from 'src/core/shares/libs/precondition/precondition';
import { ClientFlavor } from 'src/props/config_props';
import { DevImageLoader } from './dev_image_loader';
import { ImageLoader } from './image_loader';

export function getImageLoader(flavor: ClientFlavor): ImageLoader {
  switch (flavor) {
    case ClientFlavor.Web:
    case ClientFlavor.Dev:
    case ClientFlavor.Desktop:
    case ClientFlavor.Mobile:
      return new DevImageLoader();
    default:
      throw Precondition.UnreachableError(flavor);
  }
}
