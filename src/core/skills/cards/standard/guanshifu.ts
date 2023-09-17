import { GuanShiFuSkillTrigger } from 'src/core/ai/skills/cards/guanshifu';
import { CardId } from 'src/core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { AllStage, CardEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { Precondition } from 'src/core/shares/libs/precondition/precondition';
import { AI, CommonSkill, TriggerSkill } from 'src/core/skills/skill';

@AI(GuanShiFuSkillTrigger)
@CommonSkill({ name: 'guanshifu', description: 'guanshifu_description' })
export class GuanShiFuSkill extends TriggerSkill {
  get Muted() {
    return true;
  }

  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage) {
    return stage === CardEffectStage.CardEffectCancelledOut;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 2;
  }

  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return cardId !== containerCard;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    return content.fromId === owner.Id && Sanguosha.getCardById(content.cardId).GeneralName === 'slash';
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, event.fromId);
    const { triggeredOnEvent } = event;
    const slashEvent = Precondition.exists(
      triggeredOnEvent,
      'Unable to get slash event',
    ) as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    slashEvent.isCancelledOut = false;
    return true;
  }
}
