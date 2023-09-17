import classNames from "classnames";
import { Card } from "src/core/cards/card";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { CardDescription } from "src/ui/card_description/card_description";
import { Picture } from "src/ui/picture/picture";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./delayed_trick_icon.module.css";

export const DelayedTrickIcon = (props: {
  card: Card;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  className?: string;
}) => {
  const onTooltipOpeningTimer = React.useRef<null | ReturnType<
    typeof setTimeout
  >>();

  const [onTooltipOpened, setTooltipOpened] = React.useState<boolean>(false);

  function openTooltip() {
    onTooltipOpeningTimer.current = setTimeout(() => {
      setTooltipOpened(() => true);
    }, 1000);
  }

  const closeTooltip = () => {
    onTooltipOpeningTimer.current &&
      clearTimeout(onTooltipOpeningTimer.current);
    setTooltipOpened(() => false);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (onTooltipOpened) {
      closeTooltip();
    }
  };

  const { card, imageLoader, translator, className } = props;
  const imageInfo = imageLoader.getDelayedTricksImage(card.Name);
  return (
    <div
      className={classNames(styles.delayedTrickIcon, className)}
      onMouseEnter={openTooltip}
      onMouseMove={onMouseMove}
      onMouseLeave={closeTooltip}
    >
      {imageInfo ? (
        <Picture image={imageInfo} />
      ) : (
        <span className={styles.cardInitialWord}>
          {translator.tr(card.Name).slice(0, 1)}
        </span>
      )}
      {onTooltipOpened && (
        <Tooltip position={["left", "bottom"]}>
          <CardDescription translator={translator} card={card} />
        </Tooltip>
      )}
    </div>
  );
};
