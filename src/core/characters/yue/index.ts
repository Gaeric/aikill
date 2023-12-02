import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { BeiFen, ShuangJia } from 'src/core/skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class YueCaiWenJi extends Character {
  constructor(id: number) {
    super(id, 'yue_caiwenji', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Yue, [
      ...skillLoaderInstance.getSkillsByName(ShuangJia.Name),
      ...skillLoaderInstance.getSkillsByName(BeiFen.Name),
    ]);
  }
}

export const YuePackage: (index: number) => Character[] = index => [new YueCaiWenJi(index++)];
