import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class DecadeLuoTong extends Character {
  constructor(id: number) {
    super(id, 'decade_luotong', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('renzheng'),
      ...skillLorderInstance.getSkillsByName('jinjian'),
    ]);
  }
}
