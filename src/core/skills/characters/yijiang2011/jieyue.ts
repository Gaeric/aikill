import { JieYueSkillTrigger } from 'src/core/ai/skills/characters/yijiang2011/jieyue';
import { CardId } from 'src/core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { Algorithm } from 'src/core/shares/libs/algorithm';
import { System } from 'src/core/shares/libs/system';
import { TriggerSkill } from 'src/core/skills/skill';
import { AI, CommonSkill } from 'src/core/skills/skill_wrappers';
import { TranslationPack } from 'src/core/translations/translation_json_tool';

@AI(JieYueSkillTrigger)
@CommonSkill({ name: 'jieyue', description: 'jieyue_description' })
export class JieYue extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.getPlayerCards().length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  public isAvailableCard() {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: string, room: Room, target: string) {
    return target !== owner;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const yujinId = skillUseEvent.fromId;
    const yujin = room.getPlayerById(yujinId);
    const toId = skillUseEvent.toIds![0];
    await room.moveCards({
      movingCards: skillUseEvent.cardIds!.map(card => ({ card, fromArea: yujin.cardFrom(card) })),
      fromId: yujinId,
      toArea: CardMoveArea.HandArea,
      toId,
      moveReason: CardMoveReason.ActiveMove,
      proposer: yujinId,
      movedByReason: this.Name,
    });

    const to = room.getPlayerById(toId);
    if (to.getPlayerCards().length <= 0) {
      await room.drawCards(3, yujinId, undefined, toId, this.Name);
    } else {
      const askForChoice = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: ['option-one', 'option-two'],
        askedBy: yujinId,
        toId,
        conversation: TranslationPack.translationJsonPatcher(
          'jieyue: please choose jieyue options',
          this.Name,
          TranslationPack.patchPlayerInTranslation(yujin),
        ).extract(),
        triggeredBySkills: [this.Name],
      });

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChoice, toId);

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toId);

      if (response.selectedOption === 'option-one') {
        const customCardFields: {
          [x: number]: CardId[];
        } = {};

        const handCards = to.getCardIds(PlayerCardsArea.HandArea);
        const equipCards = to.getCardIds(PlayerCardsArea.EquipArea);

        if (handCards.length > 0) {
          customCardFields[PlayerCardsArea.HandArea] = handCards;
        }

        if (equipCards.length > 0) {
          customCardFields[PlayerCardsArea.EquipArea] = equipCards;
        }

        const askForDiscards =
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent>({
            toId,
            customCardFields,
            cardFilter: System.AskForChoosingCardEventFilter.JieYue,
            involvedTargets: [toId],
            customTitle: this.Name,
            triggeredBySkills: [this.Name],
          });

        room.notify(GameEventIdentifiers.AskForChoosingCardWithConditionsEvent, askForDiscards, toId);

        const { selectedCards } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
          toId,
        );

        let discards: CardId[];
        if (selectedCards === undefined) {
          discards = [
            Algorithm.randomPick(handCards.length - 1, handCards)[0],
            Algorithm.randomPick(equipCards.length - 1, equipCards)[0],
          ];
        } else {
          discards = to.getPlayerCards().filter(card => !selectedCards.includes(card));
        }

        discards = discards.filter(id => room.canDropCard(toId, id));
        if (discards.length > 0) {
          await room.dropCards(CardMoveReason.SelfDrop, discards, toId, toId, this.Name);
        }
      } else {
        await room.drawCards(3, yujinId, undefined, toId, this.Name);
      }
    }

    return true;
  }
}
