import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { Sanguosha } from '/src/core/game/engine';
import { DamageType } from '/src/core/game/game_props';
import { AllStage, CardEffectStage, DamageEffectStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';
import { TranslationPack } from '/src/core/translations/translation_json_tool';

@CompulsorySkill({ name: 'tengjia', description: 'tengjia_description' })
export class TengJiaSkill extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ) {
    return stage === CardEffectStage.PreCardEffect || stage === DamageEffectStage.DamagedEffect;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.DamageEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const effectEvent = content as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      return (
        effectEvent.toIds !== undefined &&
        effectEvent.toIds.includes(owner.Id) &&
        (Sanguosha.getCardById(effectEvent.cardId).Name === 'slash' ||
          Sanguosha.getCardById(effectEvent.cardId).GeneralName === 'nanmanruqing' ||
          Sanguosha.getCardById(effectEvent.cardId).GeneralName === 'wanjianqifa')
      );
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.toId === owner.Id && damageEvent.damageType === DamageType.Fire;
    }
    return false;
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const unknownEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.DamageEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const effectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      effectEvent.nullifiedTargets?.push(skillUseEvent.fromId);
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage++;
      damageEvent.messages = damageEvent.messages || [];
      damageEvent.messages.push(
        TranslationPack.translationJsonPatcher(
          '{0} used skill {1}, damage increases to {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId!)),
          this.Name,
          damageEvent.damage,
        ).toString(),
      );
    }

    return true;
  }
}
