import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XiaHouDun extends Character {
  constructor(id: number) {
    super(id, 'xiahoudun', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('ganglie'),
      ...skillLoaderInstance.getSkillsByName('qingjian'),
    ]);
  }
}
