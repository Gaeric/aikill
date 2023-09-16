import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, DamageEffectStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { MarkEnum } from '/src/core/shares/types/mark_list';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'junlve', description: 'junlve_description' })
export class JunLve extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamageEffect || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ) {
    return (
      (content.fromId === owner.Id && stage === DamageEffectStage.AfterDamageEffect) ||
      (content.toId === owner.Id && stage === DamageEffectStage.AfterDamagedEffect)
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.addMark(skillUseEvent.fromId, MarkEnum.JunLve, 1);
    return true;
  }
}
