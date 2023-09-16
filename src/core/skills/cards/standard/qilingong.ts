import { QiLinGongSkillTrigger } from '/src/core/ai/skills/cards/qilingong';
import { CardType } from '/src/core/cards/card';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { Sanguosha } from '/src/core/game/engine';
import { AllStage, DamageEffectStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { Precondition } from '/src/core/shares/libs/precondition/precondition';
import { AI, CommonSkill, TriggerSkill } from '/src/core/skills/skill';

@AI(QiLinGongSkillTrigger)
@CommonSkill({ name: 'qilingong', description: 'qilingong_description' })
export class QiLinGongSkill extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.DamageEffect && !event.isFromChainedDamage;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    if (!content) {
      return false;
    }

    const { cardIds, fromId, toId } = content;
    const to = room.getPlayerById(toId);
    const horses = to.getCardIds(PlayerCardsArea.EquipArea).filter(cardId => {
      const card = Sanguosha.getCardById(cardId);
      return card.is(CardType.OffenseRide) || card.is(CardType.DefenseRide);
    });
    if (horses.length === 0) {
      return false;
    }

    if (!cardIds || cardIds.length === 0 || !fromId) {
      return false;
    }
    return owner.Id === fromId && Sanguosha.getCardById(cardIds[0]).GeneralName === 'slash';
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const event = Precondition.exists(
      triggeredOnEvent,
      'Unable to get damage event',
    ) as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const to = room.getPlayerById(event.toId);

    const chooseCardEvent = {
      toId: to.Id,
      cardIds: to.getCardIds(PlayerCardsArea.EquipArea).filter(cardId => {
        const card = Sanguosha.getCardById(cardId);
        return card.is(CardType.OffenseRide) || card.is(CardType.DefenseRide);
      }),
      amount: 1,
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>(chooseCardEvent),
      event.fromId!,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardEvent,
      event.fromId!,
    );

    if (response.selectedCards === undefined) {
      return true;
    }

    await room.dropCards(CardMoveReason.PassiveDrop, response.selectedCards, to.Id, skillUseEvent.fromId, this.Name);
    return true;
  }
}
