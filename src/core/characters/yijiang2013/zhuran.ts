import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { DanShou } from 'src/core/skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhuRan extends Character {
  constructor(id: number) {
    super(id, 'zhuran', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.YiJiang2013, [
      ...skillLoaderInstance.getSkillsByName(DanShou.Name),
    ]);
  }
}
