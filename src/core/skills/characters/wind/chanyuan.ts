import { Card } from '/src/core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, HpChangeStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { Skill, SkillProhibitedSkill } from '/src/core/skills/skill';
import { OnDefineReleaseTiming, SkillLifeCycle } from '/src/core/skills/skill_hooks';
import { UniqueSkillRule } from '/src/core/skills/skill_rule';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'chanyuan', description: 'chanyuan_description' })
export class ChanYuan extends SkillProhibitedSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, player: Player) {
    if (player.Hp > 1) {
      return;
    }

    for (const playerSkill of player.getSkillProhibitedSkills(true)) {
      UniqueSkillRule.isProhibited(playerSkill, player) &&
        (await SkillLifeCycle.executeHookedOnNullifying(playerSkill, room, player));
    }
  }

  public async whenLosingSkill(room: Room, player: Player) {
    if (player.Hp > 1) {
      return;
    }

    for (const playerSkill of player.getSkillProhibitedSkills(true)) {
      await SkillLifeCycle.executeHookedOnEffecting(playerSkill, room, player);
    }
  }

  public skillFilter(skill: Skill, owner: Player, _: Card, unlimited?: boolean): boolean {
    return (owner.Hp <= 1 || !!unlimited) && skill.GeneralName !== this.Name && owner.hasSkill(skill.Name);
  }

  public toDeactivateSkills(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return owner.Hp <= 1 && stage === HpChangeStage.AfterHpChange;
  }

  public toActivateSkills(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return owner.Hp > 1 && stage === HpChangeStage.AfterHpChange;
  }
}
