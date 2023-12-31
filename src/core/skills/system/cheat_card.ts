import { CardType } from 'src/core/cards/card';
import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'src/core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { Player } from 'src/core/player/player';
import { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { Functional } from 'src/core/shares/libs/functional';
import { ActiveSkill, CommonSkill } from 'src/core/skills/skill';

@CommonSkill({ name: 'cheat_card', description: 'cheat_card_description' })
export class CheatCard extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return true;
  }

  numberOfTargets() {
    return 0;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  isAvailableTarget(): boolean {
    return false;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const askForChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      toId: skillUseEvent.fromId,
      options: [
        Functional.getCardTypeRawText(CardType.Basic),
        Functional.getCardTypeRawText(CardType.Equip),
        Functional.getCardTypeRawText(CardType.Trick),
      ],
      conversation: 'please choose',
    };
    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChoose, skillUseEvent.fromId);
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );

    const type =
      selectedOption === Functional.getCardTypeRawText(CardType.Basic)
        ? CardType.Basic
        : selectedOption === Functional.getCardTypeRawText(CardType.Equip)
          ? CardType.Equip
          : selectedOption === Functional.getCardTypeRawText(CardType.Trick)
            ? CardType.Trick
            : undefined;

    askForChoose.options = Sanguosha.getCardsByMatcher(
      new CardMatcher({
        type: type === undefined ? undefined : [type],
      }),
    ).map(card => card.Name);
    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChoose, skillUseEvent.fromId);
    const { selectedOption: selectedName } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );

    askForChoose.options = Sanguosha.getCardsByMatcher(
      new CardMatcher({
        type: type === undefined ? undefined : [type],
        name: selectedName === undefined ? undefined : [selectedName],
      }),
    ).map(card => Functional.getCardSuitRawText(card.Suit));
    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChoose, skillUseEvent.fromId);
    const { selectedOption: selectedSuit } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );
    const suitMap = {
      nosuit: CardSuit.NoSuit,
      spade: CardSuit.Spade,
      heart: CardSuit.Heart,
      club: CardSuit.Club,
      diamond: CardSuit.Diamond,
    };

    const from = room.getPlayerById(skillUseEvent.fromId);
    const cards = Sanguosha.getCardsByMatcher(
      new CardMatcher({
        name: selectedName ? [selectedName] : undefined,
        type: type === undefined ? undefined : [type],
        suit: selectedSuit === undefined ? undefined : [suitMap[selectedSuit]],
      }),
    ).filter(card => from.getCardId(card.Id) === undefined);

    if (cards.length > 0) {
      const fromOthers = room.getCardOwnerId(cards[0].Id);
      const owner = fromOthers ? room.getPlayerById(fromOthers) : undefined;
      await room.moveCards({
        movingCards: [
          {
            card: cards[0].Id,
            fromArea: owner
              ? owner.cardFrom(cards[0].Id)
              : room.isCardInDropStack(cards[0].Id)
                ? CardMoveArea.DropStack
                : CardMoveArea.DrawStack,
          },
        ],
        fromId: fromOthers,
        toId: skillUseEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: skillUseEvent.fromId,
        movedByReason: this.Name,
      });
    }

    return true;
  }
}
