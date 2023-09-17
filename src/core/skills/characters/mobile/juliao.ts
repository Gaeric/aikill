import { CharacterNationality } from 'src/core/characters/character';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { RulesBreakerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'juliao', description: 'juliao_description' })
export class JuLiao extends RulesBreakerSkill {
  public audioIndex(): number {
    return 0;
  }

  public breakDefenseDistance(room: Room, owner: Player): number {
    return (
      room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
        if (!allNations.includes(player.Nationality)) {
          allNations.push(player.Nationality);
        }
        return allNations;
      }, []).length - 1
    );
  }
}
