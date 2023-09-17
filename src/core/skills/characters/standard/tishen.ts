import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { LimitSkill, TriggerSkill } from 'src/core/skills/skill';

@LimitSkill({ name: 'tishen', description: 'tishen_description' })
export class TiShen extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId && PlayerPhaseStages.PrepareStageStart === content.toStage && owner.Hp < owner.MaxHp
    );
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    const recover = from.MaxHp - from.Hp;

    await room.recover({
      recoveredHp: recover,
      recoverBy: fromId,
      toId: fromId,
    });

    await room.drawCards(recover, fromId, 'top', fromId, this.Name);

    return true;
  }
}
