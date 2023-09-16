import { GameCharacterExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { AnJian } from '/src/core/skills/characters/yijiang2013/anjian';
import { DuoDao } from '/src/core/skills/characters/yijiang2013/duodao';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PanZhangMaZhong extends Character {
  constructor(id: number) {
    super(
      id,
      'panzhangmazhong',
      CharacterGender.Male,
      CharacterNationality.Wu,
      4,
      4,
      GameCharacterExtensions.YiJiang2013,
      [...skillLoaderInstance.getSkillsByName(AnJian.Name), skillLoaderInstance.getSkillByName(DuoDao.Name)],
    );
  }
}
