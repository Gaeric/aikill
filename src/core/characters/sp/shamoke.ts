import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ShaMoKe extends Character {
  constructor(id: number) {
    super(id, 'shamoke', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.SP, [
      ...skillLorderInstance.getSkillsByName('jili'),
    ]);
  }
}
