import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'src/core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { AllStage, SkillEffectStage } from 'src/core/game/stage_processor';
import { Player, SealOnCard } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';
import { ShuangJia, ShuangJiaRemoveSeal } from './shuangjia';

@CompulsorySkill({ name: 'beifen', description: 'beifen_description' })
export class BeiFen extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, stage?: AllStage) {
    return stage === SkillEffectStage.AfterSkillEffected;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return event.skillName === ShuangJiaRemoveSeal.Name;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    console.log('beifen effect');

    const shuangJiaCardSuits = room
      .getPlayerById(event.fromId)
      .getSeals()
      .filter(seal => seal.name == ShuangJia.Name)
      .map(seal => Sanguosha.getCardById((seal.binding as SealOnCard).cardId).Suit);

    const cardSuits = [CardSuit.Club, CardSuit.Diamond, CardSuit.Heart, CardSuit.Spade].filter(
      suit => !shuangJiaCardSuits.includes(suit),
    );
    console.log(`cardsuits is ${cardSuits}`);

    const drawCardIds = cardSuits.reduce<CardId[]>((cardIds, suit) => {
      const matchCardIds = room.findCardsByMatcherFrom(new CardMatcher({ suit: [suit] }));
      if (matchCardIds.length > 0) {
        return cardIds.concat(matchCardIds[0]);
      } else {
        return cardIds;
      }
    }, []);

    console.log(`drawCardIds is ${drawCardIds}`);

    if (drawCardIds.length === 0) {
      return false;
    }

    await room.moveCards({
      movingCards: drawCardIds.map(cardId => ({ card: cardId, fromArea: CardMoveArea.DrawStack })),
      toId: event.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}
