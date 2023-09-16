import type { GameEventIdentifiers } from '/src/core/event/event';
import type { Player } from '/src/core/player/player';
import type { Room } from '/src/core/room/room';
import type { BaGuaZhenSkill } from '/src/core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class BaGuaZhenSkillTrigger extends TriggerSkillTriggerClass<
  BaGuaZhenSkill,
  GameEventIdentifiers.AskForCardUseEvent
> {
  skillTrigger = (room: Room, ai: Player, skill: BaGuaZhenSkill) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
