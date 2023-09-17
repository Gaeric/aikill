import type { Player } from 'src/core/player/player';
import type { Room } from 'src/core/room/room';
import { ZhuQueYuShanSkill } from 'src/core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class ZhuQueYuShanSkillTrigger extends TriggerSkillTriggerClass<ZhuQueYuShanSkill> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: ZhuQueYuShanSkill) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
