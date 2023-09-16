import { BasicCard } from '/src/core/cards/basic_card';
import { GameCardExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { AlcoholSkill } from '/src/core/skills/cards/legion_fight/alcohol';
import { Single } from '../card';
import type { CardSuit, RealCardId } from '../libs/card_props';

@Single
export class Alcohol extends BasicCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      1,
      'alcohol',
      'alcohol_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName('alcohol'),
    );
  }

  public get Skill() {
    return this.skill as AlcoholSkill;
  }
}
