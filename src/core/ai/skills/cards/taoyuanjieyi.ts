import { AiLibrary } from '/src/core/ai/ai_lib';
import { ActiveSkillTriggerClass } from '/src/core/ai/skills/base/active_skill_trigger';
import type { CardId } from '/src/core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from '/src/core/event/event';
import type { Player } from '/src/core/player/player';
import type { Room } from '/src/core/room/room';
import type { TaoYuanJieYiSkill } from '/src/core/skills';

export class TaoYuanJieYiSkillTrigger extends ActiveSkillTriggerClass<TaoYuanJieYiSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: TaoYuanJieYiSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const friends = AiLibrary.sortFriendsFromWeakToStrong(room, ai).filter(
      f => room.canUseCardTo(skillInCard!, ai, f) && f.isInjured(),
    );
    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(
      e => room.canUseCardTo(skillInCard!, ai, e) && e.isInjured(),
    );
    const extra = ai.isInjured() ? 1 : 0;

    if (friends.length + extra < enemies.length) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
    };
  };
}
