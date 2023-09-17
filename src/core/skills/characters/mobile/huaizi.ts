import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { RulesBreakerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'huaizi', description: 'huaizi_description' })
export class HuaiZi extends RulesBreakerSkill {
  public audioIndex(): number {
    return 0;
  }

  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    return owner.MaxHp;
  }
}
