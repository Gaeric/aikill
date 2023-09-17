import { VirtualCard } from 'src/core/cards/card';
import { CardSuit } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { AllStage, CardUseStage, PlayerPhase } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'liubing', description: 'liubing_description' })
export class LiuBing extends TriggerSkill {
  public audioIndex(): number {
    return 0;
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardUseDeclared;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const cardUsed = Sanguosha.getCardById(content.cardId);
    return (
      !owner.hasUsedSkill(this.Name) &&
      content.fromId === owner.Id &&
      cardUsed.Suit !== CardSuit.NoSuit &&
      cardUsed.GeneralName === 'slash'
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const cardUsed = Sanguosha.getCardById(cardUseEvent.cardId);
    cardUseEvent.cardId = VirtualCard.create(
      { cardName: cardUsed.Name, cardSuit: CardSuit.Diamond, cardNumber: cardUsed.CardNumber, bySkill: this.Name },
      [cardUseEvent.cardId],
    ).Id;

    return true;
  }
}
