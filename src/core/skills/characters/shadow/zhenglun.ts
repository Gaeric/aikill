import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { MarkEnum } from '/src/core/shares/types/mark_list';
import { CommonSkill, TriggerSkill } from '/src/core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from '/src/core/translations/translation_json_tool';

@CommonSkill({ name: 'zhenglun', description: 'zhenglun_description' })
export class ZhengLun extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.BeforePhaseChange;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.toPlayer === owner.Id && content.to === PlayerPhase.DrawCardStage && owner.getMark(MarkEnum.Orange) === 0
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to skip draw card phase to gain 1 orange?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.addMark(event.fromId, MarkEnum.Orange, 1);
    await room.skip(event.fromId, PlayerPhase.DrawCardStage);

    return true;
  }
}
