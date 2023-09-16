import { CardType } from '/src/core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { Sanguosha } from '/src/core/game/engine';
import { AllStage, DamageEffectStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { CompulsorySkill, TriggerSkill } from '/src/core/skills/skill';
import { TranslationPack } from '/src/core/translations/translation_json_tool';

@CompulsorySkill({ name: 'wuyan', description: 'wuyan_description' })
export class WuYan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect || stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    if (content.cardIds === undefined || !Sanguosha.getCardById(content.cardIds[0]).is(CardType.Trick)) {
      return false;
    }

    if (stage === DamageEffectStage.DamageEffect) {
      return content.fromId === owner.Id;
    } else {
      return content.toId === owner.Id;
    }
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const damageEvent = content.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, prevent the damage of {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.Name,
      TranslationPack.patchCardInTranslation(...damageEvent.cardIds!),
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    EventPacker.terminate(damageEvent);

    return true;
  }
}
