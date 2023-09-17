import { Card, CardType } from "src/core/cards/card";
import { CardId } from "src/core/cards/libs/card_props";
import {
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from "src/core/event/event";
import { Sanguosha } from "src/core/game/engine";
import { TargetGroupUtil } from "src/core/shares/libs/utils/target_group";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import { RoomStore } from "src/pages/room/room.store";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ClientCard } from "src/ui/card/card";
import styles from "./move_instant_card.module.css";
import { Point } from "../position";
import { UiAnimation } from "../ui_animation";
import { createRoot } from "react-dom/client";

type MoveCardProps = { cardId: CardId; public: boolean };

export class MoveInstantCardAnimation extends UiAnimation {
  private readonly cardWidth = 120;
  private readonly cardHeight = 160;

  constructor(
    private store: RoomStore,
    private translator: ClientTranslationModule,
    private imageLoader: ImageLoader
  ) {
    super();
  }

  private get CentralPosition(): Point {
    const body = document.getElementsByTagName("body")[0];
    return {
      x: body.clientWidth / 2,
      y: body.clientHeight / 2,
    };
  }

  private createCard(card?: Card, offset: number = 0) {
    const style: React.CSSProperties = {
      transform: `translate(${-offset * (this.cardWidth - 16)}px, 0)`,
    };
    return (
      <ClientCard
        key={card?.Id}
        imageLoader={this.imageLoader}
        card={card}
        width={this.cardWidth}
        translator={this.translator}
        style={style}
      />
    );
  }

  private createCards(cards: MoveCardProps[]) {
    const cardsElement: JSX.Element[] = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      cardsElement.push(
        this.createCard(
          card.public ? Sanguosha.getCardById(card.cardId) : undefined,
          i
        )
      );
    }
    return cardsElement;
  }

  private async animateCardMove(
    content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>
  ) {}

  async animateCardUse(
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>
  ) {
    const { fromId, targetGroup, cardId } = content;
    if (
      fromId === this.store.clientPlayerId ||
      !targetGroup ||
      !TargetGroupUtil.getRealTargets(targetGroup).includes(fromId) ||
      !Sanguosha.getCardById(cardId).is(CardType.Equip)
    ) {
      return;
    }

    const elements = this.createCards([
      {
        cardId,
        public: true,
      },
    ]);
  }

  async animate(
    identifier: GameEventIdentifiers,
    event: ServerEventFinder<GameEventIdentifiers>
  ) {
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      await this.animateCardMove(
        event as unknown as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>
      );
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      await this.animateCardUse(
        event as unknown as ServerEventFinder<GameEventIdentifiers.CardUseEvent>
      );
    }
  }
}
