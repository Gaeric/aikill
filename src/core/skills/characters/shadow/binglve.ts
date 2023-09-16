import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { AllStage, SkillEffectStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';
import { FeiJun } from './feijun';

@CompulsorySkill({ name: 'binglve', description: 'binglve_description' })
export class BingLve extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, stage?: AllStage): boolean {
    return stage === SkillEffectStage.AfterSkillEffected;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): boolean {
    return content.fromId === owner.Id && EventPacker.getMiddleware<boolean>(FeiJun.Name, content) === true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
