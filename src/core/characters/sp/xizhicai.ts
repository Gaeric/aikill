import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class XiZhiCai extends Character {
  constructor(id: number) {
    super(id, 'xizhicai', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('tiandu'),
      ...skillLorderInstance.getSkillsByName('xianfu'),
      skillLorderInstance.getSkillByName('chouce'),
    ]);
  }
}
