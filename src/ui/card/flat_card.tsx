import classNames from "classnames";
import { Card } from "src/core/cards/card";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { CardDescription } from "src/ui/card_description/card_description";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./card.module.css";
import { CardNumberItem } from "./card_number";
import { CardSuitItem } from "./card_suit";

type FlatClientCardProps = {
  translator: ClientTranslationModule;
  card: Card;
  imageLoader: ImageLoader;
  className?: string;
};

export function FlatClientCard(props: FlatClientCardProps) {
  const [equipImage, setEquipImage] = React.useState<string | undefined>();
  const [equipName, setEquipName] = React.useState<string | undefined>();

  const [onTooltipOpened, setOnTooltipOpened] = React.useState(false);

  const onTooltipOpeningTimer = React.useRef<null | ReturnType<
    typeof setTimeout
  >>();

  async function getImage() {
    let image = await props.imageLoader.getOthersEquipCard(props.card.Name);
    setEquipName(() => image.alt);
    setEquipImage(() => image.src);
  }
  React.useEffect(() => {
    if (equipName !== props.card.Name || !equipName) {
      getImage();
    }
  });

  let openTooltip = () => {
    onTooltipOpeningTimer.current = setTimeout(() => {
      setOnTooltipOpened(true);
    }, 1000);
  };
  let closeTooltip = () => {
    onTooltipOpeningTimer.current &&
      clearTimeout(onTooltipOpeningTimer.current);
    setOnTooltipOpened(false);
  };

  let onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (onTooltipOpened) {
      closeTooltip();
    }
  };

  const { className, translator, card } = props;
  return (
    <div
      className={classNames(className, styles.flatCard)}
      onMouseEnter={openTooltip}
      onMouseMove={onMouseMove}
      onMouseLeave={closeTooltip}
    >
      {equipImage ? (
        <img className={styles.equipImage} src={equipImage} alt={equipName} />
      ) : (
        <span className={styles.equipName}>{translator.trx(card.Name)}</span>
      )}
      <span className={styles.cardSpecification}>
        <CardSuitItem suit={card.Suit} />
        <CardNumberItem
          className={styles.flatEquipNumber}
          cardNumber={card.CardNumber}
          isRed={card.isRed()}
        />
      </span>
      {onTooltipOpened && (
        <Tooltip position={["right", "bottom"]}>
          <CardDescription translator={translator} card={card} />
        </Tooltip>
      )}
    </div>
  );
}
