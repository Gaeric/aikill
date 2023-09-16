import { CharacterGender } from '/src/core/characters/character';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { RulesBreakerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'xiefang', description: 'xiefang_description' })
export class XieFang extends RulesBreakerSkill {
  public audioIndex(): number {
    return 0;
  }

  public breakOffenseDistance(room: Room, owner: Player): number {
    return room.AlivePlayers.filter(player => player.Gender === CharacterGender.Female).length;
  }
}
