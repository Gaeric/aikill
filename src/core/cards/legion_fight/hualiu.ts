import { GameCardExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { RulesBreakerSkill } from 'src/core/skills/skill';
import { DefenseRideCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class HuaLiu extends DefenseRideCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'hualiu',
      'hualiu_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName<RulesBreakerSkill>('defense_horse'),
    );
  }
}
