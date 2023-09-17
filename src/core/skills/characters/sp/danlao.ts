import { CardType } from 'src/core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { AimStage, AllStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { AimGroupUtil } from 'src/core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'src/core/skills/skill';
import { CommonSkill } from 'src/core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'src/core/translations/translation_json_tool';

@CommonSkill({ name: 'danlao', description: 'danlao_description' })
export class DanLao extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.toId === owner.Id &&
      (Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' ||
        Sanguosha.getCardById(content.byCardId).is(CardType.Trick)) &&
      AimGroupUtil.getAllTargets(content.allTargets).length > 1
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw a card and let {1} nullify to you?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.byCardId),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    await room.drawCards(1, fromId, 'top', fromId, this.Name);
    aimEvent.nullifiedTargets.push(fromId);

    return true;
  }
}
