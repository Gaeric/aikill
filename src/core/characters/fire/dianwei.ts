import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class DianWei extends Character {
  constructor(id: number) {
    super(id, 'dianwei', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Fire, [
      skillLoaderInstance.getSkillByName('qiangxi'),
    ]);
  }
}
