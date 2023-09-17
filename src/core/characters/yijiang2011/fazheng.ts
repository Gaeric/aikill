import { GameCharacterExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { XuanHuo } from 'src/core/skills';
import { EnYuan } from 'src/core/skills/characters/yijiang2011/enyuan';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class FaZheng extends Character {
  constructor(id: number) {
    super(id, 'fazheng', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.YiJiang2011, [
      skillLoaderInstance.getSkillByName(EnYuan.GeneralName),
      skillLoaderInstance.getSkillByName(XuanHuo.GeneralName),
    ]);
  }
}
