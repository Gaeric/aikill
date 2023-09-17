import { ActiveSkillTriggerClass } from 'src/core/ai/skills/base/active_skill_trigger';
import type { CardId } from 'src/core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from 'src/core/event/event';
import type { Player } from 'src/core/player/player';
import type { Room } from 'src/core/room/room';
import type { PeachSkill } from 'src/core/skills';

export class PeachSkillTrigger extends ActiveSkillTriggerClass<PeachSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: PeachSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => ({
    fromId: ai.Id,
    cardId: skillInCard!,
  });
}
