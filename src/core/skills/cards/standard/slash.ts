import { SlashSkillTrigger } from '/src/core/ai/skills/cards/slash';
import { VirtualCard } from '/src/core/cards/card';
import { CardMatcher } from '/src/core/cards/libs/card_matcher';
import { CardId } from '/src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { Sanguosha } from '/src/core/game/engine';
import { DamageType } from '/src/core/game/game_props';
import { Player } from '/src/core/player/player';
import { PlayerId } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { TagEnum } from '/src/core/shares/types/tag_list';
import { ActiveSkill, AI, CommonSkill } from '/src/core/skills/skill';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@AI(SlashSkillTrigger)
@CommonSkill({ name: 'slash', description: 'slash_description' })
export class SlashSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public readonly damageType: DamageType = DamageType.Normal;

  public canUse(room: Room, owner: Player, contentOrContainerCard: CardId) {
    return (
      room
        .getOtherPlayers(owner.Id)
        .find(
          player =>
            room.CommonRules.getCardUsableTimes(room, owner, Sanguosha.getCardById(contentOrContainerCard), player) >
            owner.cardUsedTimes(new CardMatcher({ generalName: [this.Name] })),
        ) !== undefined
    );
  }

  public isRefreshAt() {
    return true;
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isCardAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ) {
    const except: CardId[] = [];
    if (containerCard) {
      const card = Sanguosha.getCardById(containerCard);
      const ids = card.isVirtualCard() ? (card as VirtualCard).getRealActualCards() : [containerCard];
      except.push(...ids);
    }
    return room.canAttack(
      room.getPlayerById(owner),
      room.getPlayerById(target),
      containerCard,
      except.length > 0 ? except : undefined,
    );
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const player = room.getPlayerById(event.fromId);
    EventPacker.addMiddleware(
      {
        tag: TagEnum.DrunkTag,
        data: player.hasDrunk(),
      },
      event,
    );
    room.clearHeaded(player.Id);

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    const addtionalDrunkDamage = EventPacker.getMiddleware<number>(TagEnum.DrunkTag, event) || 0;
    const additionalDamage = event.additionalDamage || 0;
    const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
      fromId,
      toId: toIds![0],
      damage: 1 + addtionalDrunkDamage + additionalDamage,
      damageType: this.damageType,
      cardIds: [cardId],
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
    };

    EventPacker.addMiddleware(
      {
        tag: TagEnum.DrunkTag,
        data: addtionalDrunkDamage,
      },
      damageEvent,
    );

    await room.damage(damageEvent);

    return true;
  }
}
