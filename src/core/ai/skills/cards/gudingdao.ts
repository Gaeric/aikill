import type { Player } from '/src/core/player/player';
import type { Room } from '/src/core/room/room';
import { GuDingDaoSkill } from '/src/core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class GuDingDaoSkillTrigger extends TriggerSkillTriggerClass<GuDingDaoSkill> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: GuDingDaoSkill) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
