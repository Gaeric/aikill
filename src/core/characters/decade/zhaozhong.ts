import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhaoZhong extends Character {
  constructor(id: number) {
    super(id, 'zhaozhong', CharacterGender.Male, CharacterNationality.Qun, 6, 6, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('yangzhong'),
      skillLorderInstance.getSkillByName('huangkong'),
    ]);
  }
}
