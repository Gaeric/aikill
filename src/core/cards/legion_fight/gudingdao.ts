import { GameCardExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { GuDingDaoSkill } from 'src/core/skills/cards/legion_fight/gudingdao';
import { Skill } from 'src/core/skills/skill';
import { WeaponCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class GuDingDao extends WeaponCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'gudingdao',
      'gudingdao_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName<Skill>('gudingdao'),
      2,
    );
  }

  public get Skill() {
    return this.skill as GuDingDaoSkill;
  }
}
