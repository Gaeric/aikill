import { AiLibrary } from '/src/core/ai/ai_lib';
import { ActiveSkillTriggerClass } from '/src/core/ai/skills/base/active_skill_trigger';
import { CardType } from '/src/core/cards/card';
import type { CardId } from '/src/core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from '/src/core/event/event';
import type { Player } from '/src/core/player/player';
import type { Room } from '/src/core/room/room';
import type { NanManRuQingSkill } from '/src/core/skills';

export class NanManRuQingSkillTrigger extends ActiveSkillTriggerClass<NanManRuQingSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: NanManRuQingSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(
      e =>
        room.canUseCardTo(skillInCard!, ai, e) &&
        !e.hasSkill('juxiang') &&
        !(e.getEquipment(CardType.Shield) && e.getShield()!.Name === 'tengjia'),
    );
    if (enemies.length < room.AlivePlayers.length / 2) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
    };
  };
}
