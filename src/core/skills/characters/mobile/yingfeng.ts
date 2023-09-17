import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { INFINITE_DISTANCE } from 'src/core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { MarkEnum } from 'src/core/shares/types/mark_list';
import { GlobalRulesBreakerSkill, TriggerSkill } from 'src/core/skills/skill';
import { CommonSkill, ShadowSkill } from 'src/core/skills/skill_wrappers';

@CommonSkill({ name: 'yingfeng', description: 'yingfeng_description' })
export class YingFeng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      !!room.AlivePlayers.find(player => player.getMark(MarkEnum.Feng) === 0)
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: string, room: Room, target: string): boolean {
    return room.getPlayerById(target).getMark(MarkEnum.Feng) === 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    const fengOwner = room.AlivePlayers.find(player => player.getMark(MarkEnum.Feng) > 0);
    fengOwner && room.removeMark(fengOwner.Id, MarkEnum.Feng);
    room.addMark(event.toIds[0], MarkEnum.Feng, 1);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: YingFeng.Name, description: YingFeng.Description })
export class YingFengShadow extends GlobalRulesBreakerSkill {
  public breakGlobalCardUsableDistance(
    cardId: CardId | CardMatcher,
    room: Room,
    owner: Player,
    target: Player,
  ): number {
    return target.getMark(MarkEnum.Feng) > 0 ? INFINITE_DISTANCE : 0;
  }
}
