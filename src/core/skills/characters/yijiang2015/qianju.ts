import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { RulesBreakerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'qianju', description: 'qianju_description' })
export class QianJu extends RulesBreakerSkill {
  public audioIndex(): number {
    return 0;
  }

  public breakOffenseDistance(room: Room, owner: Player): number {
    return owner.LostHp;
  }
}
