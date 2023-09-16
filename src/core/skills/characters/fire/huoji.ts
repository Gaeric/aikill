import { VirtualCard } from '/src/core/cards/card';
import { FireAttack } from '/src/core/cards/legion_fight/fire_attack';
import { CardMatcher } from '/src/core/cards/libs/card_matcher';
import { CardId } from '/src/core/cards/libs/card_props';
import { Sanguosha } from '/src/core/game/engine';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { CommonSkill, ViewAsSkill } from '/src/core/skills/skill';

@CommonSkill({ name: 'huoji', description: 'huoji_description' })
export class HuoJi extends ViewAsSkill {
  public get RelatedCharacters(): string[] {
    return ['pangtong'];
  }

  public canViewAs(): string[] {
    return ['fire_attack'];
  }

  public canUse(room: Room, owner: Player) {
    return owner.canUseCard(room, new CardMatcher({ name: ['fire_attack'] })) && owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).isRed();
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<FireAttack>(
      {
        cardName: 'fire_attack',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}
