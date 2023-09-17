import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { LimitSkill } from 'src/core/skills/skill_wrappers';

@LimitSkill({ name: 'pve_classic_tiantong', description: 'pve_classic_tiantong_description' })
export class PveClassicTianTong extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.changeMaxHp(event.fromId, 3);
    await room.recover({
      toId: event.fromId,
      recoveredHp: 3,
      recoverBy: event.fromId,
    });
    return true;
  }
}
