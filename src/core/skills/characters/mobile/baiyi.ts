import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Player } from 'src/core/player/player';
import { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { ActiveSkill } from 'src/core/skills/skill';
import { LimitSkill } from 'src/core/skills/skill_wrappers';

@LimitSkill({ name: 'baiyi', description: 'baiyi_description' })
export class BaiYi extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return owner.LostHp > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 2;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const firstPosition = room.getPlayerById(event.toIds[0]).Position;
    const secondPosition = room.getPlayerById(event.toIds[1]).Position;

    room.changePlayerProperties({
      changedProperties: [
        { toId: event.toIds[0], playerPosition: secondPosition },
        { toId: event.toIds[1], playerPosition: firstPosition },
      ],
    });

    return true;
  }
}
