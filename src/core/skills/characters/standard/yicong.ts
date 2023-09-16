import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { CompulsorySkill, RulesBreakerSkill } from '/src/core/skills/skill';

@CompulsorySkill({ name: 'yicong', description: 'yicong_description' })
export class YiCong extends RulesBreakerSkill {
  public breakDefenseDistance(room: Room, owner: Player) {
    return owner.Hp <= 2 ? 1 : 0;
  }

  public breakOffenseDistance(room: Room, owner: Player) {
    return 1;
  }
}
