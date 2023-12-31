import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class BuLianShi extends Character {
  constructor(id: number) {
    super(id, 'bulianshi', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.YiJiang2012, [
      skillLoaderInstance.getSkillByName('anxu'),
      skillLoaderInstance.getSkillByName('zhuiyi'),
    ]);
  }
}
