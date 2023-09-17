import { TriggerSkillTriggerClass } from 'src/core/ai/skills/base/trigger_skill_trigger';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { ShangShi } from 'src/core/skills';

export class ShangShiSkillTrigger extends TriggerSkillTriggerClass<ShangShi> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: ShangShi) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
