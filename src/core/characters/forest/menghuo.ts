import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class MengHuo extends Character {
  constructor(id: number) {
    super(id, 'menghuo', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Forest, [
      skillLoaderInstance.getSkillByName('huoshou'),
      skillLoaderInstance.getSkillByName('zaiqi'),
    ]);
  }
}
