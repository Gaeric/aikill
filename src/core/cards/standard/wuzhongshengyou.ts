import { CardSuit } from '/src/core/cards/libs/card_props';
import type { RealCardId } from '/src/core/cards/libs/card_props';
import { TrickCard } from '/src/core/cards/trick_card';
import { GameCardExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { WuZhongShengYouSkill } from '/src/core/skills/cards/standard/wuzhongshengyou';

export class WuZhongShengYou extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'wuzhongshengyou',
      'wuzhongshengyou_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('wuzhongshengyou'),
    );
  }

  get Skill() {
    return this.skill as WuZhongShengYouSkill;
  }
}
