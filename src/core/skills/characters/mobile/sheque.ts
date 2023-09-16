import { CardMatcher } from '/src/core/cards/libs/card_matcher';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { TriggerSkill } from '/src/core/skills/skill';
import { CommonSkill } from '/src/core/skills/skill_wrappers';
import { TranslationPack } from '/src/core/translations/translation_json_tool';

@CommonSkill({ name: 'sheque', description: 'sheque_description' })
export class SheQue extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

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
    return (
      owner.Id !== content.playerId &&
      PlayerPhaseStages.PrepareStageStart === content.toStage &&
      room.getPlayerById(content.playerId).getCardIds(PlayerCardsArea.EquipArea).length > 0
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const changeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;

    const response = await room.askForCardUse(
      {
        toId: fromId,
        cardUserId: fromId,
        scopedTargets: [changeEvent.playerId],
        cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
        extraUse: true,
        commonUse: false,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to use a slash to {1} (this slash ignores armors)?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(changeEvent.playerId)),
        ).extract(),
        triggeredBySkills: [this.Name],
      },
      fromId,
    );

    if (response.cardId !== undefined) {
      const cardUseEvent = {
        fromId: response.fromId,
        cardId: response.cardId,
        targetGroup: [response.toIds!],
        triggeredBySkills: [this.Name],
      };

      EventPacker.addMiddleware(
        {
          tag: this.Name,
          data: cardUseEvent,
        },
        event,
      );

      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const cardUseEvent = EventPacker.getMiddleware<ServerEventFinder<GameEventIdentifiers.CardUseEvent>>(
      this.Name,
      skillUseEvent,
    );
    if (cardUseEvent === undefined) {
      return false;
    }

    await room.useCard(cardUseEvent, true);

    return true;
  }
}
