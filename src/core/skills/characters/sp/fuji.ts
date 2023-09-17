import { CardType } from 'src/core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { AllStage, CardUseStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { CompulsorySkill, TriggerSkill } from 'src/core/skills/skill';

@CompulsorySkill({ name: 'fuji', description: 'fuji_description' })
export class FuJi extends TriggerSkill {
  private static readonly FuJiUntriggerable: string[] = ['jink', 'peach', 'alcohol'];

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const card = Sanguosha.getCardById(content.cardId);
    return (
      content.fromId === owner.Id &&
      !FuJi.FuJiUntriggerable.includes(card.GeneralName) &&
      !card.is(CardType.DelayedTrick) &&
      !card.is(CardType.Equip) &&
      room.getAlivePlayersFrom().find(target => room.distanceBetween(target, owner) === 1) !== undefined
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    const targets = room
      .getAlivePlayersFrom()
      .filter(target => room.distanceBetween(target, from) === 1)
      .map(player => player.Id);

    cardUseEvent.disresponsiveList = targets;

    return true;
  }
}
