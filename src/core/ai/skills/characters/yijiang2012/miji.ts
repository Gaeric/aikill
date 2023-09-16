import { TriggerSkillTriggerClass } from '/src/core/ai/skills/base/trigger_skill_trigger';
import { GameEventIdentifiers } from '/src/core/event/event';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { MiJi } from '/src/core/skills';

export class MiJiSkillTrigger extends TriggerSkillTriggerClass<MiJi, GameEventIdentifiers.PhaseStageChangeEvent> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: MiJi) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
