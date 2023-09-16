import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { CommonSkill, TriggerSkill } from '/src/core/skills/skill';

@CommonSkill({ name: 'biyue', description: 'biyue_description' })
export class BiYue extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === content.playerId && PlayerPhaseStages.FinishStageStart === content.toStage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(
      room.getPlayerById(skillUseEvent.fromId).getCardIds(PlayerCardsArea.HandArea).length === 0 ? 2 : 1,
      skillUseEvent.fromId,
      undefined,
      skillUseEvent.fromId,
      this.Name,
    );
    return true;
  }
}
