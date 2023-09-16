import { VirtualCard } from '/src/core/cards/card';
import { CardId } from '/src/core/cards/libs/card_props';
import { Peach } from '/src/core/cards/standard/peach';
import { Sanguosha } from '/src/core/game/engine';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { CommonSkill, ViewAsSkill } from '/src/core/skills/skill';

@CommonSkill({ name: 'jijiu', description: 'jijiu_description' })
export class JiJiu extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['peach'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return room.CurrentPlayer !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).isRed();
  }

  public viewAs(selectedCards: CardId[]): VirtualCard {
    return VirtualCard.create<Peach>(
      {
        cardName: 'peach',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}
