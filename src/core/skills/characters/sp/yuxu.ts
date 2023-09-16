import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, CardUseStage, PlayerPhase } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { TriggerSkill } from '/src/core/skills/skill';
import { CommonSkill } from '/src/core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from '/src/core/translations/translation_json_tool';

@CommonSkill({ name: 'yuxu', description: 'yuxu_description' })
export class YuXu extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PlayCardStage;
  }

  public isAutoTrigger(room: Room, owner: Player): boolean {
    return owner.hasUsedSkillTimes(this.Name) % 2 === 1;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer === owner &&
      !(
        owner.hasUsedSkillTimes(this.Name) % 2 === 1 &&
        owner.getPlayerCards().find(id => room.canDropCard(owner.Id, id)) === undefined
      )
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher('{0}: do you want to draw a card?', this.Name).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (room.getPlayerById(event.fromId).hasUsedSkillTimes(this.Name) % 2 === 1) {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    } else {
      const response = await room.askForCardDrop(
        event.fromId,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
      );
      response.droppedCards.length > 0 &&
        (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, event.fromId, event.fromId, this.Name));
    }

    return true;
  }
}
