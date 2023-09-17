import { CardType, VirtualCard } from 'src/core/cards/card';
import { Alcohol } from 'src/core/cards/legion_fight/alcohol';
import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardId } from 'src/core/cards/libs/card_props';
import { Sanguosha } from 'src/core/game/engine';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { RulesBreakerSkill, ViewAsSkill } from 'src/core/skills/skill';
import { CommonSkill, ShadowSkill } from 'src/core/skills/skill_wrappers';

@CommonSkill({ name: 'qishe', description: 'qishe_description' })
export class QiShe extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['alcohol'];
  }

  public canUse(room: Room, owner: Player) {
    return owner.canUseCard(room, new CardMatcher({ name: ['alcohol'] })) && owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).is(CardType.Equip);
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<Alcohol>(
      {
        cardName: 'alcohol',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: QiShe.Name, description: QiShe.Description })
export class QiSheShadow extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    return owner.getCardIds(PlayerCardsArea.EquipArea).length;
  }
}
