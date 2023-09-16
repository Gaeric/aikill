import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodXunYu extends Character {
  constructor(id: number) {
    super(id, 'god_xunyu', CharacterGender.Male, CharacterNationality.God, 3, 3, GameCharacterExtensions.God, [
      ...skillLoaderInstance.getSkillsByName('tianzuo'),
      skillLoaderInstance.getSkillByName('lingce'),
      skillLoaderInstance.getSkillByName('dinghan'),
    ]);
  }
}
