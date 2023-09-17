import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { XianSi } from 'src/core/skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LiuFeng extends Character {
  constructor(id: number) {
    super(id, 'liufeng', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.YiJiang2013, [
      ...skillLoaderInstance.getSkillsByName(XianSi.Name),
    ]);
  }
}
