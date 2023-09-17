import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { AllStage, DamageEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';
import { TranslationPack } from 'src/core/translations/translation_json_tool';

@CompulsorySkill({ name: 'jueqing', description: 'jueqing_description' })
export class JueQing extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageStart;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return event.fromId === owner.Id && !room.getPlayerById(event.toId).Dead;
  }

  public async onTrigger(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    EventPacker.terminate(damageEvent);
    await room.loseHp(damageEvent.toId, damageEvent.damage);

    return true;
  }
}
