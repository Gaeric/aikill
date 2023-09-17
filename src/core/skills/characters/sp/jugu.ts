import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, GameBeginStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'jugu', description: 'jugu_description' })
export class JuGu extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>, stage?: AllStage): boolean {
    return stage === GameBeginStage.AfterGameBegan;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(room.getPlayerById(event.fromId).MaxHp, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: JuGu.Name, description: JuGu.Description })
export class JuGuShadow extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    return owner.MaxHp;
  }
}
