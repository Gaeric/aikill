import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaiZhenJi extends Character {
  constructor(id: number) {
    super(
      id,
      'caizhenji',
      CharacterGender.Female,
      CharacterNationality.Wei,
      3,
      3,
      GameCharacterExtensions.Benevolence,
      [skillLoaderInstance.getSkillByName('sheyi'), skillLoaderInstance.getSkillByName('tianyin')],
    );
  }
}
