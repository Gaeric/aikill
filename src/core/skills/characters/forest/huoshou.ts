import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { Sanguosha } from 'src/core/game/engine';
import { AimStage, AllStage, CardEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { NanManRuQingSkill } from 'src/core/skills/cards/standard/nanmanruqing';
import { CompulsorySkill, TriggerSkill } from 'src/core/skills/skill';
import { TranslationPack } from 'src/core/translations/translation_json_tool';

@CompulsorySkill({ name: 'huoshou', description: 'huoshou_description' })
export class HuoShou extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.AimEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardEffectStage.PreCardEffect || stage === AimStage.AfterAim;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.AimEvent>,
  ): boolean {
    const unknownEvent = EventPacker.getIdentifier(event);
    if (unknownEvent === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = event as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      return (
        cardEffectEvent.toIds !== undefined &&
        cardEffectEvent.toIds.includes(owner.Id) &&
        Sanguosha.getCardById(cardEffectEvent.cardId).GeneralName === 'nanmanruqing'
      );
    } else if (unknownEvent === GameEventIdentifiers.AimEvent) {
      const aimEvent = event as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.byCardId !== undefined &&
        Sanguosha.getCardById(aimEvent.byCardId).GeneralName === 'nanmanruqing' &&
        aimEvent.fromId !== owner.Id &&
        aimEvent.isFirstTarget
      );
    }

    return false;
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = content.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.AimEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      content.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} triggered skill {1}, nullify {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
        this.Name,
        TranslationPack.patchCardInTranslation(cardEffectEvent.cardId),
      ).extract();
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      content.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} triggered skill {1}, become the source of damage dealed by {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
        this.Name,
        TranslationPack.patchCardInTranslation(aimEvent.byCardId!),
      ).extract();
    }

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.AimEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      cardEffectEvent.nullifiedTargets?.push(event.fromId);
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      EventPacker.addMiddleware(
        {
          tag: NanManRuQingSkill.NewSource,
          data: event.fromId,
        },
        aimEvent,
      );
    }

    return true;
  }
}
