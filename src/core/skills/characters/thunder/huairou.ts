import { CardType } from 'src/core/cards/card';
import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { Player } from 'src/core/player/player';
import { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { ActiveSkill, CommonSkill } from 'src/core/skills/skill';

@CommonSkill({ name: 'huairou', description: 'huairou_description' })
export class HuaiRou extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return owner.getPlayerCards().length > 0;
  }

  public numberOfTargets(): number {
    return 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).is(CardType.Equip);
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.reforge(cardIds[0], room.getPlayerById(fromId));

    return true;
  }
}
