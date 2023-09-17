import { VirtualCard } from 'src/core/cards/card';
import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { ViewAsSkill } from 'src/core/skills/skill';
import { CircleSkill, CommonSkill } from 'src/core/skills/skill_wrappers';

@CircleSkill
@CommonSkill({ name: 'weijing', description: 'weijing_description' })
export class WeiJing extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['jink', 'slash'];
  }

  public canUse(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>) {
    if (owner.hasUsedSkill(this.Name)) {
      return false;
    }

    const identifier = event && EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      return (
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ generalName: ['slash'] })) ||
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ name: ['jink'] }))
      );
    }

    return (
      owner.canUseCard(room, new CardMatcher({ name: ['slash'] })) &&
      identifier !== GameEventIdentifiers.AskForCardResponseEvent
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    return VirtualCard.create({
      cardName: viewAs,
      bySkill: this.Name,
    });
  }
}
