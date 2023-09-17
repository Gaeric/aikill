import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { AwakeningSkill } from 'src/core/skills/skill_wrappers';
import { TranslationPack } from 'src/core/translations/translation_json_tool';

@AwakeningSkill({ name: 'zhi_sanchen', description: 'zhi_sanchen_description' })
export class ZhiSanChen extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['miewu'];
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      room.enableToAwaken(this.Name, owner)
    );
  }

  public async onTrigger(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    await room.changeMaxHp(fromId, 1);
    await room.recover({
      toId: fromId,
      recoveredHp: 1,
      recoverBy: fromId,
    });

    await room.obtainSkill(fromId, 'miewu', true);

    return true;
  }
}
