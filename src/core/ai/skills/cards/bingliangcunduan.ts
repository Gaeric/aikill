import { AiLibrary } from '/src/core/ai/ai_lib';
import { ActiveSkillTriggerClass } from '/src/core/ai/skills/base/active_skill_trigger';
import type { CardId } from '/src/core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from '/src/core/event/event';
import type { Player } from '/src/core/player/player';
import type { Room } from '/src/core/room/room';
import { BingLiangCunDuanSkill } from '/src/core/skills';

export class BingLiangCunDuanSkillTrigger extends ActiveSkillTriggerClass<BingLiangCunDuanSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: BingLiangCunDuanSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const availableTargets = AiLibrary.sortEnemiesByRole(room, ai).filter(target =>
      skill.isAvailableTarget(ai.Id, room, target.Id, [], [], skillInCard!),
    );

    const targets = this.filterTargets(room, ai, skill, skillInCard!, availableTargets);
    if (targets.length === 0) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
      toIds: targets,
    };
  };
}
