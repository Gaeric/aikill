import { GameCardExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { ThunderSlashSkill } from '/src/core/skills/cards/legion_fight/thunder_slash';
import { CardSuit, RealCardId } from '../libs/card_props';
import { Slash } from '../standard/slash';

export class ThunderSlash extends Slash {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit);

    this.name = 'thunder_slash';
    this.description = 'thunder_slash_description';
    this.fromPackage = GameCardExtensions.LegionFight;
    this.skill = SkillLoader.getInstance().getSkillByName('thunder_slash');
  }

  public get Skill() {
    return this.skill as ThunderSlashSkill;
  }
}
