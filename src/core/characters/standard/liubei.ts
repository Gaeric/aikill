import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class LiuBei extends Character {
  constructor(id: number) {
    super(id, 'liubei', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Standard, [
      ...skillLoaderInstance.getSkillsByName('rende'),
      ...skillLoaderInstance.getSkillsByName('jijiang'),
      ...skillLoaderInstance.getSkillsByName('wangong'),
      skillLoaderInstance.getSkillByName('pve_longshen_longlin'),
      ...skillLoaderInstance.getSkillsByName('liushi'),
    ]);
  }
}
