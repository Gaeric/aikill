import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { Dialog } from "src/ui/dialog/dialog";
import { Picture } from "src/ui/picture/picture";
import styles from "./acknowledge_dialog.module.css";

export const AcknowledgeDialog = ({
  imageLoader,
  onClose,
}: {
  imageLoader: ImageLoader;
  onClose(): void;
}) => (
  <Dialog className={styles.acknowledge} onClose={onClose}>
    <Picture
      className={styles.background}
      image={imageLoader.getAcknowledgementImage()}
    />
  </Dialog>
);
