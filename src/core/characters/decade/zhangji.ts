import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhangJi extends Character {
  constructor(id: number) {
    super(id, 'zhangji', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('lveming'),
      skillLorderInstance.getSkillByName('tunjun'),
    ]);
  }
}
