import type { ActiveSkillTrigger } from 'src/core/ai/ai_skill_trigger';
import type { CardId } from 'src/core/cards/libs/card_props';
import { Player } from 'src/core/player/player';
import type { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import type { ActiveSkill } from 'src/core/skills/skill';
import { BaseSkillTrigger } from './base_trigger';

export class ActiveSkillTriggerClass<T extends ActiveSkill = ActiveSkill> extends BaseSkillTrigger {
  protected filterTargets(room: Room, ai: Player, skill: ActiveSkill, card: CardId, targets: Player[]) {
    const pickedTargets: PlayerId[] = [];

    for (const target of targets) {
      if (skill.targetFilter(room, ai, [...pickedTargets, target.Id], [], card)) {
        pickedTargets.push(target.Id);
      }
    }

    return pickedTargets;
  }

  public readonly skillTrigger: ActiveSkillTrigger<T> = (room: Room, ai: Player, skill: T, card?: CardId): undefined =>
    undefined;

  public reforgeTrigger(room: Room, ai: Player, skill: T, card: CardId): boolean {
    return false;
  }

  public dynamicallyAdjustSkillUsePriority(
    room: Room,
    ai: Player,
    skill: ActiveSkill,
    sortedActions: (ActiveSkill | CardId)[],
  ) {
    return sortedActions;
  }
}
