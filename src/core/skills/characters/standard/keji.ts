import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { Sanguosha } from '/src/core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { CommonSkill, TriggerSkill } from '/src/core/skills/skill';

@CommonSkill({ name: 'keji', description: 'keji_description' })
export class KeJi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.BeforePhaseChange;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    if (content.to === PlayerPhase.DropCardStage && owner.Id === content.toPlayer) {
      return (
        room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>(
          event =>
            (EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent ||
              EventPacker.getIdentifier(event) === GameEventIdentifiers.CardResponseEvent) &&
            event.fromId === owner.Id &&
            Sanguosha.getCardById(event.cardId).GeneralName === 'slash',
          owner.Id,
          'round',
          [PlayerPhase.PlayCardStage],
          1,
        ).length === 0
      );
    }

    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.skip(skillUseEvent.fromId, PlayerPhase.DropCardStage);

    return true;
  }
}
