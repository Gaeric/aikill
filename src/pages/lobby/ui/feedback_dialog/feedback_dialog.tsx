import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { Dialog } from "src/ui/dialog/dialog";
import { Picture } from "src/ui/picture/picture";
import { feedBackContent } from "./feedback_content";
import styles from "./feedback_dialog.module.css";

export const FeedbackDialog = React.memo(
  ({ imageLoader, onClose }: { imageLoader: ImageLoader; onClose(): void }) => (
    <Dialog onClose={onClose} className={styles.feedback}>
      <Picture
        image={imageLoader.getFeedbackImage()}
        className={styles.background}
      />
      <div
        className={styles.feedbackInfo}
        dangerouslySetInnerHTML={{ __html: feedBackContent }}
      />
    </Dialog>
  )
);
