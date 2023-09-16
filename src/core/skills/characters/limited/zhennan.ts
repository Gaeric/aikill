import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { Sanguosha } from '/src/core/game/engine';
import { DamageType } from '/src/core/game/game_props';
import { AimStage, AllStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerId } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { AimGroupUtil } from '/src/core/shares/libs/utils/aim_group';
import { TriggerSkill } from '/src/core/skills/skill';
import { CommonSkill } from '/src/core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from '/src/core/translations/translation_json_tool';

@CommonSkill({ name: 'zhennan', description: 'zhennan_description' })
export class ZhenNan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      event.isFirstTarget &&
      Sanguosha.getCardById(event.byCardId).isCommonTrick() &&
      AimGroupUtil.getAllTargets(event.allTargets).length > 1
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to deal 1 damage to another player?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    await room.damage({
      fromId: event.fromId,
      toId: event.toIds[0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}
