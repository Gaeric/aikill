import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class LiuZan extends Character {
  constructor(id: number) {
    super(id, 'new_liuzan', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('new_fenyin'),
      ...skillLorderInstance.getSkillsByName('liji'),
    ]);
  }
}
