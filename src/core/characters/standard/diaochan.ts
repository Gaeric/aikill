import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class DiaoChan extends Character {
  constructor(id: number) {
    super(id, 'diaochan', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('lijian'),
      skillLoaderInstance.getSkillByName('biyue'),
    ]);
  }
}
