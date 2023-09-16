import { CardType } from '/src/core/cards/card';
import { CardId } from '/src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { Sanguosha } from '/src/core/game/engine';
import type { Player } from '/src/core/player/player';
import type { Room } from '/src/core/room/room';
import { QiLinGongSkill } from '/src/core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class QiLinGongSkillTrigger extends TriggerSkillTriggerClass<QiLinGongSkill> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: QiLinGongSkill) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });

  onAskForChoosingCardEvent(content: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent>, room: Room) {
    const { cardIds, toId } = content;
    const cardId =
      (cardIds as CardId[]).find(card => Sanguosha.getCardById(card).is(CardType.DefenseRide)) ||
      (cardIds as CardId[])[0];
    return {
      fromId: toId,
      selectedCards: [cardId],
    };
  }
}
