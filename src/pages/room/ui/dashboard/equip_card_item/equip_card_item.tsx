import classNames from "classnames";
import { Card, CardType } from "src/core/cards/card";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";

import * as React from "react";
import { CardNumberItem } from "src/ui/card/card_number";
import { CardSuitItem } from "src/ui/card/card_suit";

import { CardDescription } from "src/ui/card_description/card_description";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./equip_card_item.module.css";

type EquipCardItemProps = {
  disabled?: boolean;
  highlight?: boolean;
  card: Card;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  onClick?(selected: boolean): void;
};

export function EquipCardItem(props: EquipCardItemProps) {
  const [selected, setSelected] = React.useState(false);
  const [equipCardImage, setEquipCardImage] = React.useState<
    string | undefined
  >();
  const [onTooltipOpened, setOnTooltipOpened] = React.useState(false);
  const onTooltipOpeningTimer = React.useRef<null | ReturnType<
    typeof setTimeout
  >>();
  const [cardName, setCardName] = React.useState<string>(props.card.Name);
  let onCardClick = () => {
    if (props.disabled === false) {
      let currentSelected = !selected;
      setSelected(currentSelected);
      props.onClick && props.onClick(currentSelected);
    }
  };
  async function getImage() {
    let currentEquipCardImage = (
      await props.imageLoader.getSlimEquipCard(props.card.Name)
    ).src;
    console.log("获取equipCardImage: " + currentEquipCardImage);
    setEquipCardImage(() => currentEquipCardImage);
  }
  React.useEffect(() => {
    if (!!props.disabled) {
      setSelected(() => false);
    }
    getImage();
  }, []);

  React.useEffect(() => {
    if (cardName !== props.card.Name || !cardName) {
      setCardName(() => props.card.Name);
      getImage();
    }
  }, [cardName]);

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

  const { card, translator, highlight } = props;
  return (
    <div
      className={classNames(styles.equipCardItem, {
        [styles.weapon]: card?.is(CardType.Weapon),
        [styles.armor]: card?.is(CardType.Shield),
        [styles.defenseRide]: card?.is(CardType.DefenseRide),
        [styles.offenseRide]: card?.is(CardType.OffenseRide),
        [styles.precious]: card?.is(CardType.Precious),
        [styles.selected]: selected && !props.disabled,
        [styles.disabled]:
          highlight === undefined ? props.disabled : !highlight,
      })}
      onClick={onCardClick}
      onMouseEnter={openTooltip}
      onMouseMove={onMouseMove}
      onMouseLeave={closeTooltip}
    >
      {equipCardImage ? (
        <img src={equipCardImage} className={styles.equipCardImage} alt="" />
      ) : (
        <span className={styles.equipCardName}>
          {card && translator.tr(card.Name)}
        </span>
      )}
      <>
        {card && (
          <CardSuitItem className={styles.equipCardSuit} suit={card.Suit} />
        )}
        <CardNumberItem
          className={styles.equipCardNumber}
          cardNumber={card.CardNumber}
          isRed={card.isRed()}
        />
      </>
      {onTooltipOpened && (
        <Tooltip position={["left", "bottom"]}>
          <CardDescription translator={translator} card={card} />
        </Tooltip>
      )}
    </div>
  );
}
