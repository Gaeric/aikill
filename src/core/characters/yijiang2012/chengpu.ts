import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ChengPu extends Character {
  constructor(id: number) {
    super(id, 'chengpu', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.YiJiang2012, [
      ...skillLoaderInstance.getSkillsByName('lihuo'),
      ...skillLoaderInstance.getSkillsByName('chunlao'),
    ]);
  }
}
