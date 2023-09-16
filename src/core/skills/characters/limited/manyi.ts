import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { Sanguosha } from '/src/core/game/engine';
import { AllStage, CardEffectStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';
import { TranslationPack } from '/src/core/translations/translation_json_tool';

@CompulsorySkill({ name: 'manyi', description: 'manyi_description' })
export class ManYi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage): boolean {
    return stage === CardEffectStage.PreCardEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>): boolean {
    return (
      event.toIds !== undefined &&
      event.toIds.includes(owner.Id) &&
      Sanguosha.getCardById(event.cardId).GeneralName === 'nanmanruqing'
    );
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const cardEffectEvent = content.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, nullify {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.Name,
      TranslationPack.patchCardInTranslation(cardEffectEvent.cardId),
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardEffectEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    cardEffectEvent.nullifiedTargets?.push(event.fromId);

    return true;
  }
}
