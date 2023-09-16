import { WanJianQiFaSkillTrigger } from '/src/core/ai/skills/cards/wanjianqifa';
import { CardMatcher } from '/src/core/cards/libs/card_matcher';
import { CardId } from '/src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { DamageType } from '/src/core/game/game_props';
import { Player } from '/src/core/player/player';
import { PlayerId } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { Precondition } from '/src/core/shares/libs/precondition/precondition';
import { ActiveSkill, AI, CommonSkill } from '/src/core/skills/skill';
import { TranslationPack } from '/src/core/translations/translation_json_tool';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@AI(WanJianQiFaSkillTrigger)
@CommonSkill({ name: 'wanjianqifa', description: 'wanjianqifa_description' })
export class WanJianQiFaSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    if (containerCard) {
      for (const target of room.getOtherPlayers(owner.Id)) {
        if (owner.canUseCardTo(room, containerCard, target.Id)) {
          return true;
        }
      }
    }

    return false;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(): boolean {
    return true;
  }

  public isCardAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const others = room.getOtherPlayers(event.fromId);
    const from = room.getPlayerById(event.fromId);
    const groups = others.filter(player => from.canUseCardTo(room, event.cardId, player.Id)).map(player => [player.Id]);
    event.targetGroup = [...groups];
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    const to = Precondition.exists(toIds, 'Unknown targets in wanjianqifa')[0];

    let responseCard: CardId | undefined;
    if (!EventPacker.isDisresponsiveEvent(event)) {
      const askForCardEvent = {
        cardMatcher: new CardMatcher({
          name: ['jink'],
        }).toSocketPassenger(),
        byCardId: cardId,
        cardUserId: fromId,
        conversation:
          fromId !== undefined
            ? TranslationPack.translationJsonPatcher(
                '{0} used {1} to you, please response a {2} card',
                TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
                TranslationPack.patchCardInTranslation(cardId),
                'jink',
              ).extract()
            : TranslationPack.translationJsonPatcher('please response a {0} card', 'jink').extract(),
        triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
      };

      const response = await room.askForCardResponse(
        {
          ...askForCardEvent,
          toId: to,
          triggeredBySkills: [this.Name],
        },
        to,
      );

      responseCard = response.cardId;
    }

    if (responseCard === undefined) {
      const eventContent = {
        fromId,
        toId: to,
        damage: 1 + (event.additionalDamage ? event.additionalDamage : 0),
        damageType: DamageType.Normal,
        cardIds: [event.cardId],
        triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
      };

      await room.damage(eventContent);
    } else {
      const cardResponsedEvent = {
        fromId: to,
        cardId: responseCard,
        responseToEvent: event,
      };
      EventPacker.terminate(event);

      await room.responseCard(cardResponsedEvent);
    }

    return true;
  }
}
