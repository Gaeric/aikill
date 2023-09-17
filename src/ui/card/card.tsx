import classNames from "classnames";
import { Card, VirtualCard } from "src/core/cards/card";
import { Sanguosha } from "src/core/game/engine";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";

import * as React from "react";
import { CardDescription } from "src/ui/card_description/card_description";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./card.module.css";
import { CardNumberItem } from "./card_number";
import { CardSuitItem } from "./card_suit";

export type ClientCardProps = {
  id?: string;
  card?: Card;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  className?: string;
  disabled?: boolean;
  highlight?: boolean;
  unselectable?: boolean;
  onSelected?(selected: boolean): void;
  tags?: string | string[];
  width?: number;
  offsetLeft?: number;
  offsetTop?: number;
  style?: React.CSSProperties;
  onMouseUp?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMouseDown?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMouseMove?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMouseLeave?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMouseEnter?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  cardRef?:
    | ((instance: HTMLDivElement | null) => void)
    | React.RefObject<HTMLDivElement>;
  selected?: boolean;
};

export function ClientCard(props: ClientCardProps) {
  const [cardImage, setCardImage] = React.useState<string | undefined>("");
  const [realFlatCardImage, setRealFlatCardImage] = React.useState<
    string | undefined
  >();

  const [originalCard, setOriginalCard] = React.useState<Card | undefined>();

  const [onTooltipOpened, setOnTooltipOpened] = React.useState<boolean>(false);

  let onTooltipOpeningTimer = React.useRef<null | ReturnType<
    typeof setTimeout
  >>();

  let soundTracks: string[] = [];

  function onClick() {
    if (props.disabled === false) {
      props.onSelected && props.onSelected(!props.selected);
    }
  }

  function playAudio(): string {
    const randomIndex = Math.round(Math.random() * soundTracks.length);
    return soundTracks[randomIndex];
  }

  function getCardRatioSize(): React.CSSProperties {
    const { width = 120, offsetLeft = 0, offsetTop = 0 } = props;
    const height = (width * 4) / 3;
    return {
      width,
      height,
      transform: `translate(${offsetLeft}px, ${offsetTop}px)`,
    };
  }

  async function initComponent() {
    const { card } = props;
    if (!card) {
      return;
    }

    if (
      card.isVirtualCard() &&
      (card as VirtualCard).ActualCardIds.length === 1
    ) {
      setOriginalCard(() =>
        Sanguosha.getCardById((card as VirtualCard).ActualCardIds[0])
      );

      let realFlatCardImageUrl = (
        await props.imageLoader.getSlimCard(card.Name)
      ).src;
      if (realFlatCardImageUrl) {
        setRealFlatCardImage(() => realFlatCardImageUrl);
      }

      let CardImageUrl = (
        await props.imageLoader.getCardImage(originalCard.Name)
      ).src;
      if (CardImageUrl) {
        setCardImage(() => CardImageUrl);
      }
    } else {
      setOriginalCard(() => props.card);
      let url = (await props.imageLoader.getCardImage(card.Name)).src;
      if (url) {
        setCardImage(() => url);
      }
    }
  }
  React.useEffect(() => {
    initComponent();
  });

  function CardComponent() {
    const { card, translator, imageLoader, tags, highlight } = props;
    if (!card) {
      const cardBack = imageLoader.getCardBack();
      return (
        <div className={styles.emptyCard}>
          <img
            src={cardBack.src}
            className={styles.cardImage}
            alt={translator.tr(cardBack.alt)}
          />
        </div>
      );
    }

    return (
      <div
        className={classNames(styles.innerCard, {
          [styles.disabled]:
            highlight === undefined ? props.disabled : !highlight,
        })}
      >
        {originalCard && (
          <div className={styles.cornerTag}>
            <CardNumberItem
              cardNumber={originalCard.CardNumber}
              isRed={originalCard.isRed()}
            />
            <CardSuitItem suit={originalCard.Suit} />
          </div>
        )}
        {cardImage ? (
          <img className={styles.cardImage} src={cardImage} alt={card.Name} />
        ) : (
          <span>{translator.tr(card.Name)}</span>
        )}
        {realFlatCardImage && (
          <>
            <div className={styles.flatCardNumber}>
              <CardSuitItem suit={card.Suit} />
              <CardNumberItem
                cardNumber={card.CardNumber}
                isRed={card.isRed()}
              />
            </div>
            <img
              className={styles.innterFlatCardImage}
              src={realFlatCardImage}
              alt={card.Name}
            />
          </>
        )}
        {tags &&
          (tags instanceof Array ? (
            <span className={styles.cardTag}>
              {tags.map(
                (tag) =>
                  translator.tr(tag) +
                  (tags[tags.length - 1] === tag ? "" : " ")
              )}
            </span>
          ) : (
            <span className={styles.cardTag}>{translator.trx(tags)}</span>
          ))}
      </div>
    );
  }

  function openTooltip(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    props.onMouseEnter?.(e);
    onTooltipOpeningTimer.current = setTimeout(() => {
      setOnTooltipOpened(() => true);
    }, 1000);
  }

  function closeTooltip() {
    onTooltipOpeningTimer.current &&
      clearTimeout(onTooltipOpeningTimer.current);
    setOnTooltipOpened(() => false);
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (onTooltipOpened) {
      closeTooltip();
    }

    props.onMouseMove && props.onMouseMove(e);
  }

  function onMouseLeave(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    closeTooltip();
    props.onMouseLeave && props.onMouseLeave(e);
  }

  const { className, style = {}, card, translator } = props;

  return (
    <div
      id={props.id}
      ref={props.cardRef}
      className={classNames(styles.clientCard, className, {
        [styles.selected]: props.selected,
      })}
      style={{
        ...getCardRatioSize(),
        ...style,
      }}
      onClick={onClick}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={openTooltip}
    >
      {CardComponent()}
      {onTooltipOpened && card && (
        <Tooltip position={[]} className={styles.cardDescription}>
          <CardDescription translator={translator} card={card} />
        </Tooltip>
      )}
    </div>
  );
}
