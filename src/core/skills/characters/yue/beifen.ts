import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'src/core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder, WorkPlace } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { Player, SealOnCard } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { RulesBreakerSkill } from 'src/core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'src/core/skills/skill_wrappers';
import { ShuangJia, ShuangJiaRemoveSeal } from './shuangjia';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'src/core/game/game_props';
import { EffectHookSkill } from '../../skill_utils';

@CompulsorySkill({ name: 'beifen', description: 'beifen_description' })
export class BeiFen extends EffectHookSkill {
  public canUse(_room: Room, _owner: Player, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return event.skillName === ShuangJiaRemoveSeal.Name;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const shuangJiaCardSuits = room
      .getPlayerById(event.fromId)
      .getSeals()
      .filter(seal => seal.name == ShuangJia.Name)
      .map(seal => Sanguosha.getCardById((seal.binding as SealOnCard).cardId).Suit);

    const cardSuits = [CardSuit.Club, CardSuit.Diamond, CardSuit.Heart, CardSuit.Spade].filter(
      suit => !shuangJiaCardSuits.includes(suit),
    );

    const drawCardIds = cardSuits.reduce<CardId[]>((cardIds, suit) => {
      const matchCardIds = room.findCardsByMatcherFrom(new CardMatcher({ suit: [suit] }));
      if (matchCardIds.length > 0) {
        return cardIds.concat(matchCardIds[0]);
      } else {
        return cardIds;
      }
    }, []);

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

@ShadowSkill
@CompulsorySkill({ name: BeiFen.Name, description: BeiFen.Description })
export class BeiFenBuf extends RulesBreakerSkill {
  private bufAvailable(owner: Player): boolean {
    return (
      owner.getSeals().filter(seal => seal.name === ShuangJia.Name).length <
      owner.getCardIds(PlayerCardsArea.HandArea).length
    );
  }

  public breakCardUsableTimes(_cardId: CardId | CardMatcher, _room: Room<WorkPlace>, owner: Player): number {
    if (this.bufAvailable(owner)) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }

  public breakCardUsableDistanceTo(
    _cardId: CardId | CardMatcher | undefined,
    _room: Room<WorkPlace>,
    owner: Player,
    _target: Player,
  ): number {
    if (this.bufAvailable(owner)) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }
}
