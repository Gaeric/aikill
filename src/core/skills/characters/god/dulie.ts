import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { Sanguosha } from '/src/core/game/engine';
import { AimStage, AllStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from '/src/core/shares/libs/judge_matchers';
import { AimGroupUtil } from '/src/core/shares/libs/utils/aim_group';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'dulie', description: 'dulie_description' })
export class DuLie extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.OnAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.toId === owner.Id &&
      !room.getPlayerById(content.fromId).Dead &&
      room.getPlayerById(content.fromId).Hp > owner.Hp &&
      Sanguosha.getCardById(content.byCardId).GeneralName === 'slash'
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    const judgeEvent = await room.judge(fromId, undefined, this.Name, JudgeMatcherEnum.DuLie);
    if (JudgeMatcher.onJudge(judgeEvent.judgeMatcherEnum!, Sanguosha.getCardById(judgeEvent.judgeCardId))) {
      AimGroupUtil.cancelTarget(aimEvent, fromId);
    }

    return true;
  }
}
