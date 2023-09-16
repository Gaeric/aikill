import { GameCardExtensions } from '/src/core/game/game_props';
import { SkillLoader } from '/src/core/game/package_loader/loader.skills';
import { Skill } from '/src/core/skills/skill';
import { WeaponCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class QingLongYanYueDao extends WeaponCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'qinglongyanyuedao',
      'qinglongyanyuedao_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName<Skill>('qinglongyanyuedao'),
      3,
    );
  }
}
