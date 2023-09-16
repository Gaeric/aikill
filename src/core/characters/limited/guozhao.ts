import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class GuoZhao extends Character {
  constructor(id: number) {
    super(id, 'guozhao', CharacterGender.Female, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('pianchong'),
      skillLorderInstance.getSkillByName('zunwei'),
    ]);
  }
}
