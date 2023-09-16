import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class DecadeMiHeng extends Character {
  constructor(id: number) {
    super(id, 'decade_miheng', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Decade, [
      ...skillLorderInstance.getSkillsByName('decade_kuangcai'),
      skillLorderInstance.getSkillByName('decade_shejian'),
    ]);
  }
}
