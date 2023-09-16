import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { Functional } from '/src/core/shares/libs/functional';
import { CompulsorySkill, TriggerSkill } from '/src/core/skills/skill';
import { TranslationPack } from '/src/core/translations/translation_json_tool';

@CompulsorySkill({ name: 'dangxian', description: 'dangxian_description' })
export class DangXian extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.to === PlayerPhase.PhaseBegin && content.toPlayer === owner.Id;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, started an extra {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
      Functional.getPlayerPhaseRawText(PlayerPhase.PlayCardStage),
    ).extract();
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const card = room.getCardsByNameFromStack('slash', 'drop', 1)[0];

    if (card) {
      await room.moveCards({
        moveReason: CardMoveReason.ActivePrey,
        movedByReason: this.Name,
        toArea: CardMoveArea.HandArea,
        toId: skillUseEvent.fromId,
        movingCards: [{ card, fromArea: CardMoveArea.DropStack }],
      });
    }

    room.insertPlayerPhase(skillUseEvent.fromId, PlayerPhase.PlayCardStage);
    return true;
  }
}
