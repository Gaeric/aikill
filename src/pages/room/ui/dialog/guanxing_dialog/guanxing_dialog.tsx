import { Card } from "src/core/cards/card";
import { CardId } from "src/core/cards/libs/card_props";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import { RoomPresenter } from "src/pages/room/room.presenter";
import * as React from "react";
import { ClientCard } from "src/ui/card/card";
import { CardSlot } from "src/ui/card/card_slot";
import styles from "./guanxing_dialog.module.css";
import { BaseDialog } from "../base_dialog";

export type GuanXingDialogProps = {
  cards: Card[];
  translator: ClientTranslationModule;
  top: number;
  topStackName: string;
  bottom: number;
  bottomStackName: string;
  presenter: RoomPresenter;
  imageLoader: ImageLoader;
  onConfirm?(top: Card[], bottom: Card[]): () => void;
  title?: string;
  movable?: boolean;
  topMaxCard?: number;
  topMinCard?: number;
  bottomMaxCard?: number;
  bottomMinCard?: number;
};

const EmptyCardSlots = (props: {
  slotName: string;
  length: number;
  translator: ClientTranslationModule;
}) => {
  const slots: JSX.Element[] = [];
  for (let i = 0; i < props.length; i++) {
    slots.push(
      <CardSlot
        width={100}
        slotName={props.slotName}
        className={styles.cardSlot}
        key={i}
        translator={props.translator}
      />
    );
  }

  return <>{slots}</>;
};

export function GuanXingCardSlots(props: GuanXingDialogProps) {
  let cardWidth = 100;
  let cardMargin = 2;
  const [topCards, setTopCards] = React.useState<Card[]>([]);
  const [bottomCards, setBottomCards] = React.useState<Card[]>([]);

  let [movingCardPosition, setMovingCardPosition] = React.useState<
    | {
        x: number;
        y: number;
      }
    | undefined
  >();
  let [focusedCard, setFocusedCard] = React.useState<Card | undefined>();
  let [cardStyles, setCardStyles] = React.useState<React.CSSProperties[]>(
    new Array(props.cards.length)
  );
  const [cardPositions, setCardPositions] = React.useState<{
    [K in CardId]: {
      top: number;
      left: number;
    };
  }>({});

  React.useEffect(() => {
    if (props.onConfirm) {
      props.presenter.defineConfirmButtonActions(
        props.onConfirm(topCards, bottomCards)
      );
    }

    let currentCardPositions = cardPositions;
    for (let i = 0; i < props.cards.length; i++) {
      const card = props.cards[i];
      setTopCards([...topCards, card]);
      currentCardPositions[card.Id] = {
        left: getCardLeftOffset(i),
        top: 0,
      };
    }
    setCardPositions(currentCardPositions);
  });

  function updateCardOffset(
    movingCard: Card,
    to: "top" | "bottom",
    targetIndex: number
  ) {
    const originalIndex = getCardPositionIndex(movingCard);
    const from = getCardStack(movingCard);
    const toCardOffset = getCardLeftOffset(targetIndex);

    let currentCardPositions = cardPositions;
    if (from === to) {
      const minMovingRange = getCardLeftOffset(
        Math.min(originalIndex, targetIndex)
      );
      const maxMovingRange = getCardLeftOffset(
        Math.max(originalIndex, targetIndex)
      );

      for (const cardId of Object.keys(currentCardPositions)) {
        if (cardId === movingCard.Id.toString()) {
          continue;
        }

        if (
          currentCardPositions[cardId].top ===
            currentCardPositions[movingCard.Id].top &&
          currentCardPositions[cardId].left >= minMovingRange &&
          currentCardPositions[cardId].left <= maxMovingRange
        ) {
          if (targetIndex <= originalIndex) {
            currentCardPositions[cardId].left += getCardLeftOffset(1);
          } else {
            currentCardPositions[cardId].left -= getCardLeftOffset(1);
          }
        }
      }
      currentCardPositions[movingCard.Id].left = toCardOffset;
    } else {
      for (const cardId of Object.keys(currentCardPositions)) {
        if (cardId === movingCard.Id.toString()) {
          continue;
        }

        if (
          currentCardPositions[cardId].top ===
            currentCardPositions[movingCard.Id].top &&
          currentCardPositions[cardId].left >=
            currentCardPositions[movingCard.Id].left
        ) {
          currentCardPositions[cardId].left -= getCardLeftOffset(1);
        } else if (
          currentCardPositions[cardId].top !==
            currentCardPositions[movingCard.Id].top &&
          currentCardPositions[cardId].left >= toCardOffset
        ) {
          currentCardPositions[cardId].left += getCardLeftOffset(1);
        }
      }
      currentCardPositions[movingCard.Id].left = toCardOffset;
      currentCardPositions[movingCard.Id].top = to === "bottom" ? 158 : 0;
    }
    setCardPositions(currentCardPositions);
  }

  function getCardLeftOffset(index: number) {
    return (cardWidth + cardMargin * 2) * index;
  }

  function getCardPositionIndex(card: Card) {
    return Math.floor(
      cardPositions[card.Id].left / (cardWidth + cardMargin * 2)
    );
  }

  function getCardStack(card: Card): "top" | "bottom" {
    if (cardPositions[card.Id].top === 0) {
      return "top";
    }

    return "bottom";
  }

  function calculateMovingPosition(
    card: Card,
    top: number,
    left: number
  ): { index: number; to: "top" | "bottom" } {
    let to: "bottom" | "top" = "top";
    const from = getCardStack(card);
    if (props.bottom !== 0) {
      if (from === "top") {
        to = top >= 104 ? "bottom" : "top";
      } else {
        to = top <= -104 ? "top" : "bottom";
      }
    }

    let maxLength = to === "top" ? topCards.length : bottomCards.length;
    if (from === to) {
      maxLength--;
    }

    const currentIndex = getCardPositionIndex(card);
    const index = Math.max(
      Math.min(
        currentIndex + Math.round(left / (cardMargin + cardWidth)),
        maxLength
      ),
      0
    );

    return { to, index };
  }

  function addToStack(card: Card, place: "top" | "bottom", index: number) {
    let currentTopCards = topCards;
    let currentBottomCards = bottomCards;
    if (place === "top") {
      if (place !== getCardStack(card)) {
        currentTopCards.splice(index, 0, card);
        const deleteIndex = currentBottomCards.findIndex(
          (seekingCard) => seekingCard === card
        );
        if (deleteIndex >= 0) {
          currentBottomCards.splice(deleteIndex, 1);
        }
      } else {
        const swapIndex = currentTopCards.findIndex(
          (seekingCard) => seekingCard === card
        );
        if (swapIndex >= 0) {
          [currentTopCards[swapIndex], currentTopCards[index]] = [
            currentTopCards[index],
            currentTopCards[swapIndex],
          ];
        }
      }
    } else {
      if (place !== getCardStack(card)) {
        currentBottomCards.push(card);
        const deleteIndex = currentTopCards.findIndex(
          (seekingCard) => seekingCard === card
        );
        if (deleteIndex >= 0) {
          currentTopCards.splice(deleteIndex, 1);
        }
      } else {
        const swapIndex = currentBottomCards.findIndex(
          (seekingCard) => seekingCard === card
        );
        if (swapIndex >= 0) {
          [currentBottomCards[swapIndex], currentBottomCards[index]] = [
            currentBottomCards[index],
            currentBottomCards[swapIndex],
          ];
        }
      }
    }
    setTopCards(currentTopCards);
    setBottomCards(currentBottomCards);
  }

  let onDrag =
    (card: Card, index: number) =>
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (movingCardPosition === undefined || focusedCard !== card) {
        return;
      }

      const left = e.clientX - movingCardPosition.x;
      const top = e.clientY - movingCardPosition.y;

      let currentCardStyles = cardStyles;
      currentCardStyles[index] = {
        ...currentCardStyles[index],
        top,
        left,
      };
      setCardStyles(currentCardStyles);
    };

  let onMouseDown =
    (card: Card, index: number) =>
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const { topMaxCard, bottomMaxCard } = props;

      let canMove = true;
      if (bottomCards.includes(card)) {
        if (topMaxCard !== undefined && topCards.length === topMaxCard) {
          canMove = false;
        }
      } else {
        if (
          bottomMaxCard !== undefined &&
          bottomCards.length === bottomMaxCard
        ) {
          canMove = false;
        }
      }
      if (!canMove) {
        return false;
      }
      setMovingCardPosition({
        x: e.clientX,
        y: e.clientY,
      });
      setFocusedCard(card);

      let currentCardStyles = cardStyles;
      currentCardStyles[index] = {
        ...currentCardStyles[index],
        zIndex: 10,
        transition: "none",
      };
      setCardStyles(currentCardStyles);
    };

  let onMouseUp =
    (card: Card, index: number) =>
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (movingCardPosition === undefined || focusedCard !== card) {
        return;
      }

      const left = e.clientX - movingCardPosition.x;
      const top = e.clientY - movingCardPosition.y;
      const { to: place, index: targetIndex } = calculateMovingPosition(
        card,
        top,
        left
      );
      addToStack(card, place, targetIndex);
      updateCardOffset(card, place, targetIndex);

      setMovingCardPosition(undefined);
      setFocusedCard(undefined);

      let currentCardStyles = cardStyles;
      currentCardStyles[index] = {
        top: 0,
        left: 0,
      };
      setCardStyles(currentCardStyles);
    };
  let onMouseLeave =
    (card: Card, index: number) =>
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      setMovingCardPosition(undefined);

      setFocusedCard(undefined);

      let currentCardStyles = cardStyles;

      currentCardStyles[index] = {
        top: 0,
        left: 0,
      };
      setCardStyles(currentCardStyles);
    };

  let getInsertIndex = (card: Card, from: "top" | "bottom") => {
    const { cards } = props;
    const currentCards = from === "top" ? topCards : bottomCards;
    const originalIndex = cards.findIndex(
      (originalCard) => originalCard === card
    );
    for (let i = 0; i < currentCards.length; i++) {
      const cardIndex = cards.findIndex(
        (originalCard) => originalCard === currentCards[i]
      );
      if (cardIndex > originalIndex) {
        return i;
      }
    }

    return currentCards.length;
  };

  let onClick = (card: Card, index: number) => () => {
    const cardIndex = topCards.findIndex((topCard) => card === topCard);
    if (cardIndex >= 0 && bottomCards.length < 2) {
      const targetIndex = getInsertIndex(card, "bottom");
      addToStack(card, "bottom", index);
      updateCardOffset(card, "bottom", targetIndex);
    } else if (cardIndex < 0) {
      const targetIndex = getInsertIndex(card, "top");
      addToStack(card, "top", index);
      updateCardOffset(card, "top", targetIndex);
    }
  };

  function canConfirm() {
    const { presenter, topMaxCard, topMinCard, bottomMaxCard, bottomMinCard } =
      props;
    let canConfirm = true;
    if (topMaxCard !== undefined && topCards.length > topMaxCard) {
      canConfirm = false;
    }
    if (topMinCard !== undefined && topCards.length < topMinCard) {
      canConfirm = false;
    }
    if (bottomMaxCard !== undefined && bottomCards.length > bottomMaxCard) {
      canConfirm = false;
    }
    if (bottomMinCard !== undefined && bottomCards.length < bottomMinCard) {
      canConfirm = false;
    }

    if (canConfirm) {
      presenter.enableActionButton("confirm");
    } else {
      presenter.disableActionButton("confirm");
    }
    presenter.broadcastUIUpdate();
  }

  let onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
  };

  const {
    top,
    bottom,
    cards,
    translator,
    topStackName,
    bottomStackName,
    movable,
    imageLoader,
  } = props;
  canConfirm();

  return (
    <div className={styles.cardSlots} onMouseDown={onAction}>
      <div className={styles.topCards}>
        {cards.map((card, index) => (
          <ClientCard
            key={index}
            card={card}
            imageLoader={imageLoader}
            translator={translator}
            disabled={movable}
            highlight={!!movable}
            unselectable={true}
            onSelected={!movable ? onClick(card, index) : undefined}
            onMouseUp={movable ? onMouseUp(card, index) : undefined}
            onMouseDown={movable ? onMouseDown(card, index) : undefined}
            onMouseMove={movable ? onDrag(card, index) : undefined}
            onMouseLeave={movable ? onMouseLeave(card, index) : undefined}
            offsetLeft={cardPositions[card.Id] && cardPositions[card.Id].left}
            offsetTop={cardPositions[card.Id] && cardPositions[card.Id].top}
            className={styles.guanxingCard}
            style={cardStyles[index]}
            width={100}
          />
        ))}
      </div>

      <div className={styles.topSlots}>
        <EmptyCardSlots
          length={top}
          slotName={topStackName}
          translator={translator}
        />
      </div>
      {bottom && (
        <div className={styles.bottomSlots}>
          <EmptyCardSlots
            length={bottom}
            slotName={bottomStackName}
            translator={translator}
          />
        </div>
      )}
    </div>
  );
}

export const GuanXingDialog = (props: GuanXingDialogProps) => {
  const { translator, title } = props;

  return (
    <BaseDialog title={title && translator.trx(title)}>
      <GuanXingCardSlots {...props} />
    </BaseDialog>
  );
};
