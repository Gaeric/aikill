import { CardType, VirtualCard } from 'src/core/cards/card';
import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardId } from 'src/core/cards/libs/card_props';
import { Slash } from 'src/core/cards/standard/slash';
import { Sanguosha } from 'src/core/game/engine';
import { INFINITE_DISTANCE } from 'src/core/game/game_props';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { CommonSkill, RulesBreakerSkill, ShadowSkill, ViewAsSkill } from 'src/core/skills/skill';

@CommonSkill({ name: 'duanliang', description: 'duanliang_description' })
export class DuanLiang extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['bingliangcunduan'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return owner.canUseCard(room, new CardMatcher({ name: ['bingliangcunduan'] }));
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId,
    cardMatcher?: CardMatcher,
  ): boolean {
    const card = Sanguosha.getCardById(pendingCardId);
    const isAvailable = cardMatcher
      ? cardMatcher.match(new CardMatcher({ type: [CardType.Basic] })) ||
        cardMatcher.match(new CardMatcher({ type: [CardType.Equip] }))
      : card.is(CardType.Basic) || card.is(CardType.Equip);
    return isAvailable && card.isBlack();
  }

  public viewAs(selectedCards: CardId[]): VirtualCard {
    return VirtualCard.create<Slash>(
      {
        cardName: 'bingliangcunduan',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: DuanLiang.Name, description: DuanLiang.Description })
export class DuanLiangShadow extends RulesBreakerSkill {
  breakCardUsableDistanceTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player) {
    if (owner.getCardIds(PlayerCardsArea.HandArea).length > target.getCardIds(PlayerCardsArea.HandArea).length) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ name: ['bingliangcunduan'] })) ? INFINITE_DISTANCE : 0;
    } else {
      const card = Sanguosha.getCardById(cardId);
      return card.GeneralName === 'bingliangcunduan' ? INFINITE_DISTANCE : 0;
    }
  }
}
