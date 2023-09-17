import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { DamageType } from 'src/core/game/game_props';
import { AllStage, DamageEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'shixin', description: 'shixin_description' })
export class ShiXin extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return content.toId === owner.Id && content.damageType === DamageType.Fire;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    EventPacker.terminate(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>);

    return true;
  }
}
