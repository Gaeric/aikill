import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { JieYue } from 'src/core/skills/characters/yijiang2011/jieyue';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class YuJin extends Character {
  constructor(id: number) {
    super(id, 'yujin', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.YiJiang2011, [
      skillLoaderInstance.getSkillByName(JieYue.GeneralName),
    ]);
  }
}
