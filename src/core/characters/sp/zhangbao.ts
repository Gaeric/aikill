import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhangBao extends Character {
  constructor(id: number) {
    super(id, 'zhangbao', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('zhoufu'),
      skillLorderInstance.getSkillByName('yingbing'),
    ]);
  }
}
