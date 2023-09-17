import classNames from "classnames";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import { RoomPresenter } from "src/pages/room/room.presenter";
import { RoomStore } from "src/pages/room/room.store";
import * as React from "react";
import { ClientCard } from "src/ui/card/card";
import styles from "./move_card.module.css";
import { useState } from "react";

type MoveCardProps = {
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  presenter: RoomPresenter;
  store: RoomStore;
};

export function MoveCard(props: MoveCardProps) {
  let displayedCardsRef = React.useRef<HTMLDivElement>();
  let cardWidth = 120;
  let cardMargin = 2;

  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);

  function calculateDisplayedCardOffset(totalCards: number, index: number) {
    const container = displayedCardsRef.current;
    if (!container) {
      return cardMargin;
    }

    const containerWidth = container.clientWidth;
    const innerOffset =
      Math.min(
        cardWidth * totalCards + cardMargin * (totalCards + 1),
        containerWidth
      ) /
        2 -
      cardWidth / 2;
    if (containerWidth < totalCards * (cardWidth + cardMargin)) {
      const offset =
        (totalCards * (cardWidth + cardMargin) - containerWidth) /
        (totalCards - 1);
      return (
        (totalCards - index - 1) * (cardMargin + cardWidth - offset) -
        innerOffset
      );
    } else {
      return (
        (totalCards - index - 1) * (cardMargin + cardWidth) +
        cardMargin * 2 -
        innerOffset
      );
    }
  }

  function onDisplayCardFocused(index: number) {
    setFocusedCardIndex(index);
  }

  function onDisplayCardLeft() {
    setFocusedCardIndex(null);
  }

  return (
    <div className={styles.displayedCards} ref={displayedCardsRef}>
      {props.store.displayedCards.map((displayCard, index) => (
        <ClientCard
          id={
            displayCard.animationPlayed
              ? undefined
              : displayCard.card.Id.toString()
          }
          imageLoader={props.imageLoader}
          key={index}
          card={displayCard.card}
          tags={displayCard.tag}
          width={cardWidth}
          offsetLeft={calculateDisplayedCardOffset(
            props.store.displayedCards.length,
            index
          )}
          translator={props.translator}
          className={classNames(styles.displayedCard, {
            [styles.darken]: displayCard.buried,
            [styles.focused]: focusedCardIndex === index,
          })}
          onMouseEnter={() => onDisplayCardFocused(index)}
          onMouseLeave={() => onDisplayCardLeft()}
          style={props.store.displayedCardsAnimationStyles[displayCard.card.Id]}
        />
      ))}
    </div>
  );
}
