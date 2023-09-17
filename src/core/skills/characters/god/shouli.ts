import { CardType } from 'src/core/cards/card';
import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, GameStartStage } from 'src/core/game/stage_processor';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'shouli', description: 'shouli_description' })
export class ShouLi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === GameStartStage.AfterGameStarted;
  }

  public canUse(): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    let currentPlayer = room.getNextAlivePlayer(event.fromId);
    while (currentPlayer.Id !== event.fromId) {
      const rides = room.findCardsByMatcherFrom(
        new CardMatcher({ type: [CardType.DefenseRide, CardType.OffenseRide] }),
      );
      if (rides.length < 1) {
        break;
      }

      await room.useCard(
        {
          fromId: currentPlayer.Id,
          targetGroup: [[currentPlayer.Id]],
          cardId: rides[Math.floor(Math.random() * rides.length - 1)],
          customFromArea: CardMoveArea.DrawStack,
        },
        true,
      );

      currentPlayer = room.getNextAlivePlayer(currentPlayer.Id);
    }

    return true;
  }
}
