import { CardType, VirtualCard } from 'src/core/cards/card';
import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardId } from 'src/core/cards/libs/card_props';
import { Sanguosha } from 'src/core/game/engine';
import { PlayerPhase } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { Precondition } from 'src/core/shares/libs/precondition/precondition';
import { CommonSkill, ViewAsSkill } from 'src/core/skills/skill';

@CommonSkill({ name: 'qice', description: 'qice_description' })
export class QiCe extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player, selectedCards?: CardId[], cardMatcher?: CardMatcher): string[] {
    return cardMatcher
      ? []
      : Sanguosha.getCardNameByType(types => types.includes(CardType.Trick) && !types.includes(CardType.DelayedTrick));
  }

  isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PlayCardStage;
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      !owner.hasUsedSkill(this.Name) &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      owner.canUseCard(
        room,
        new CardMatcher({
          name: Sanguosha.getCardNameByType(
            types => types.includes(CardType.Trick) && !types.includes(CardType.DelayedTrick),
          ),
        }),
      )
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return false;
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown qice card');
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
      },
      owner.getCardIds(PlayerCardsArea.HandArea),
    );
  }
}
