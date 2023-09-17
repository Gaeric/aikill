import { TriggerSkillTriggerClass } from 'src/core/ai/skills/base/trigger_skill_trigger';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { XiaoJi } from 'src/core/skills';
export class XiaoJiSkillTrigger extends TriggerSkillTriggerClass<XiaoJi> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: XiaoJi) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
