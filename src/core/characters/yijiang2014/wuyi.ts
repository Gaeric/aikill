import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class WuYi extends Character {
  constructor(id: number) {
    super(id, 'wuyi', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.YiJiang2014, [
      ...skillLoaderInstance.getSkillsByName('benxi'),
    ]);
  }
}
