import { VirtualCard } from '/src/core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { Sanguosha } from '/src/core/game/engine';
import { DamageType } from '/src/core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from '/src/core/shares/libs/judge_matchers';
import { TriggerSkill } from '/src/core/skills/skill';
import { CommonSkill } from '/src/core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from '/src/core/translations/translation_json_tool';
import { JiBing } from './jibing';

@CommonSkill({ name: 'binghuo', description: 'binghuo_description' })
export class BingHuo extends TriggerSkill {
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
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>(
        event =>
          (EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent ||
            EventPacker.getIdentifier(event) === GameEventIdentifiers.CardResponseEvent) &&
          Sanguosha.getCardById(event.cardId).isVirtualCard() &&
          (Sanguosha.getCardById(event.cardId) as VirtualCard).findByGeneratedSkill(JiBing.Name),
        undefined,
        'round',
        undefined,
        1,
      ).length > 0
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to judge, and if the result’s color is black, you deal 1 thunder damage to the target?',
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

    const judgeEvent = await room.judge(event.toIds[0], undefined, this.Name, JudgeMatcherEnum.BingHuo);
    if (JudgeMatcher.onJudge(judgeEvent.judgeMatcherEnum!, Sanguosha.getCardById(judgeEvent.judgeCardId))) {
      await room.damage({
        fromId: event.fromId,
        toId: event.toIds[0],
        damage: 1,
        damageType: DamageType.Thunder,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}
