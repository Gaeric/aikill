import { CardType } from '/src/core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { Sanguosha } from '/src/core/game/engine';
import { AimStage, AllStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { AimGroupUtil } from '/src/core/shares/libs/utils/aim_group';
import { CommonSkill, TriggerSkill } from '/src/core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from '/src/core/translations/translation_json_tool';

@CommonSkill({ name: 'tushe', description: 'tushe_description' })
export class TuShe extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      content.isFirstTarget &&
      !Sanguosha.getCardById(content.byCardId).is(CardType.Equip) &&
      owner.getCardIds(PlayerCardsArea.HandArea).find(id => Sanguosha.getCardById(id).is(CardType.Basic)) === undefined
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw {1} card(s)?',
      this.Name,
      AimGroupUtil.getAllTargets(event.allTargets).length,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const num = AimGroupUtil.getAllTargets(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).allTargets,
    ).length;
    await room.drawCards(num, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
