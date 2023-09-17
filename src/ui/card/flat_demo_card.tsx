import classNames from "classnames";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import styles from "./card.module.css";

type FlatClientCardProps = {
  translator: ClientTranslationModule;
  cardName: string;
  imageLoader: ImageLoader;
  className?: string;
  onClick?(cardName: string): void;
};

export function FlatDemoCard(props: FlatClientCardProps) {
  const [cardImage, setCardImage] = React.useState<string | undefined>();

  let onClick = () => {
    props.onClick && props.onClick(props.cardName);
  };

  React.useEffect(() => {
    setCardImage(props.imageLoader.getSlimCard(props.cardName).src);
  });

  const { className, translator, cardName } = props;
  return (
    <div
      className={classNames(className, styles.flatDemoCard)}
      onClick={onClick}
    >
      {cardImage ? (
        <img
          className={styles.flatCardImage}
          src={cardImage}
          alt={translator.tr(cardName)}
        />
      ) : (
        <span className={styles.flatCardName}>{translator.tr(cardName)}</span>
      )}
    </div>
  );
}
