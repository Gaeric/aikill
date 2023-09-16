import { GameCardExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { RulesBreakerSkill } from '/src/core/skills/skill';
import { OffenseRideCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class DaYuan extends OffenseRideCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'dayuan',
      'dayuan_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName<RulesBreakerSkill>('offense_horse'),
    );
  }
}
