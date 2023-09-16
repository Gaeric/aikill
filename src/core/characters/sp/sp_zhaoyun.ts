import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class SPZhaoYun extends Character {
  constructor(id: number) {
    super(id, 'sp_zhaoyun', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('std_longdan'),
      skillLorderInstance.getSkillByName('chongzhen'),
    ]);
  }
}
