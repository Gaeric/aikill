import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { AwakeningSkill, LordSkill } from 'src/core/skills/skill_wrappers';
import { TranslationPack } from 'src/core/translations/translation_json_tool';

@LordSkill
@AwakeningSkill({ name: 'ruoyu', description: 'ruoyu_description' })
export class RuoYu extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['jijiang', 'sishu'];
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.playerId === owner.Id && room.enableToAwaken(this.Name, owner);
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const fromId = skillEffectEvent.fromId;

    await room.changeMaxHp(fromId, 1);
    await room.recover({
      recoveredHp: 1,
      toId: fromId,
      recoverBy: fromId,
      triggeredBySkills: [this.Name],
    });
    await room.obtainSkill(fromId, 'jijiang', true);
    await room.obtainSkill(fromId, 'sishu', true);

    return true;
  }
}
