import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GuoJia extends Character {
  constructor(id: number) {
    super(id, 'guojia', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('tiandu'),
      ...skillLoaderInstance.getSkillsByName('yiji'),
    ]);
  }
}
