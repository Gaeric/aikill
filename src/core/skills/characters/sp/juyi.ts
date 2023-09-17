import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { BengHuai, WeiZhong } from 'src/core/skills';
import { TriggerSkill } from 'src/core/skills/skill';
import { AwakeningSkill } from 'src/core/skills/skill_wrappers';
import { TranslationPack } from 'src/core/translations/translation_json_tool';

@AwakeningSkill({ name: 'juyi', description: 'juyi_description' })
export class JuYi extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['benghuai', 'weizhong'];
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && room.enableToAwaken(this.Name, owner);
  }

  public async onTrigger(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    await room.drawCards(room.getPlayerById(fromId).MaxHp, fromId, 'top', fromId, this.Name);

    await room.obtainSkill(fromId, BengHuai.Name);
    await room.obtainSkill(fromId, WeiZhong.Name);

    return true;
  }
}
