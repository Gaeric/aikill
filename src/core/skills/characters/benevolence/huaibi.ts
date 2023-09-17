import { CharacterNationality } from 'src/core/characters/character';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { RulesBreakerSkill } from 'src/core/skills/skill';
import { CompulsorySkill, LordSkill } from 'src/core/skills/skill_wrappers';
import { YaoHu } from './yaohu';

@LordSkill
@CompulsorySkill({ name: 'huaibi', description: 'huaibi_description' })
export class HuaiBi extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    const nationality = owner.getFlag<CharacterNationality>(YaoHu.Name);
    return nationality !== undefined
      ? room.AlivePlayers.filter(player => player.Nationality === nationality).length
      : 0;
  }
}
