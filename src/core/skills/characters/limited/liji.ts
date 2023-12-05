import { CardId } from 'src/core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { DamageType } from 'src/core/game/game_props';
import { Player } from 'src/core/player/player';
import { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { ActiveSkill } from 'src/core/skills/skill';
import { CommonSkill } from 'src/core/skills/skill_wrappers';

@CommonSkill({ name: 'liji', description: 'liji_description' })
export class LiJi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    const cards = room.getRoundDropCards();
    const divisor = room.AlivePlayers.length < 5 ? 4 : 8;
    return owner.hasUsedSkillTimes(this.Name) < Math.floor(cards.length / divisor);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, _room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public cardFilter(_room: Room, _owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, fromId, fromId, this.Name);

    await room.damage({
      fromId,
      toId: event.toIds[0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}
