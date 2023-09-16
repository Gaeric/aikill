import { AiLibrary } from '/src/core/ai/ai_lib';
import { ActiveSkillTriggerClass } from '/src/core/ai/skills/base/active_skill_trigger';
import { CardMatcher } from '/src/core/cards/libs/card_matcher';
import type { CardId } from '/src/core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from '/src/core/event/event';
import type { Player } from '/src/core/player/player';
import type { Room } from '/src/core/room/room';
import type { AlcoholSkill } from '/src/core/skills';

export class AlcoholSkillTrigger extends ActiveSkillTriggerClass<AlcoholSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: AlcoholSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const slashMatcher = new CardMatcher({ generalName: ['slash'] });
    if (!ai.canUseCard(room, slashMatcher)) {
      return;
    }

    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(
      e => AiLibrary.getAttackWillEffectSlashesTo(room, ai, e).length > 0,
    );

    if (enemies.length === 0) {
      return;
    }

    const slashes = AiLibrary.findAvailableCardsToUse(room, ai, slashMatcher);
    if (slashes.length === 0) {
      return;
    }
    return {
      fromId: ai.Id,
      cardId: skillInCard!,
    };
  };
}
