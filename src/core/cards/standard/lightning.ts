import { CardSuit } from 'src/core/cards/libs/card_props';
import type { RealCardId } from 'src/core/cards/libs/card_props';
import { DelayedTrick, TrickCard } from 'src/core/cards/trick_card';
import { GameCardExtensions } from 'src/core/game/game_props';
import { SkillLoader } from 'src/core/game/package_loader/loader.skills';
import { LightningSkill } from 'src/core/skills/cards/standard/lightning';

@DelayedTrick
export class Lightning extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'lightning',
      'lightning_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('lightning'),
    );
  }

  get Skill() {
    return this.skill as LightningSkill;
  }
}
