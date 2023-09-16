import { VirtualCard } from '/src/core/cards/card';
import { CardMatcher } from '/src/core/cards/libs/card_matcher';
import { CardId } from '/src/core/cards/libs/card_props';
import { Jink } from '/src/core/cards/standard/jink';
import { Sanguosha } from '/src/core/game/engine';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { CommonSkill, ViewAsSkill } from '/src/core/skills/skill';

@CommonSkill({ name: 'qingguo', description: 'qingguo_description' })
export class QingGuo extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['jink'];
  }
  public canUse(room: Room, owner: Player) {
    return owner.canUseCard(room, new CardMatcher({ name: ['jink'] }));
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).isBlack();
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<Jink>(
      {
        cardName: 'jink',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}
