import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { ChengXiang } from 'src/core/skills/characters/yijiang2013/chengxiang';
import { RenXin } from 'src/core/skills/characters/yijiang2013/renxin';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaoChong extends Character {
  constructor(id: number) {
    super(id, 'caochong', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.YiJiang2013, [
      skillLoaderInstance.getSkillByName(ChengXiang.Name),
      skillLoaderInstance.getSkillByName(RenXin.Name),
    ]);
  }
}
