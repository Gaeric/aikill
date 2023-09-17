import { Card, VirtualCard } from 'src/core/cards/card';
import { CardId } from 'src/core/cards/libs/card_props';
import { Sanguosha } from 'src/core/game/engine';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { AlcoholSkill } from 'src/core/skills/cards/legion_fight/alcohol';
import { OnDefineReleaseTiming, TransformSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'jinjiu', description: 'jinjiu_description' })
export class JinJiu extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (this.canTransform(owner, cardId)) {
        return this.forceToTransformCardTo(cardId).Id;
      }

      return cardId;
    });

    owner.setupCards(PlayerCardsArea.HandArea, cards);
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (!Card.isVirtualCardId(cardId)) {
        return cardId;
      }

      const card = Sanguosha.getCardById<VirtualCard>(cardId);
      if (!card.findByGeneratedSkill(this.Name)) {
        return cardId;
      }

      return card.ActualCardIds[0];
    });

    owner.setupCards(PlayerCardsArea.HandArea, cards);
  }

  public canTransform(owner: Player, cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return card.GeneralName === AlcoholSkill.GeneralName;
  }

  public includesJudgeCard() {
    return true;
  }

  public forceToTransformCardTo(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return VirtualCard.create(
      {
        cardName: 'slash',
        cardNumber: card.CardNumber,
        cardSuit: card.Suit,
        bySkill: this.Name,
      },
      [cardId],
    );
  }
}
