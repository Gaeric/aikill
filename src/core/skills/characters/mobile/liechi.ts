import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, PlayerDyingStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'liechi', description: 'liechi_description' })
export class LieChi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return (
      content.dying === owner.Id &&
      content.killedBy !== undefined &&
      !room.getPlayerById(content.killedBy).Dead &&
      room.getPlayerById(content.killedBy).getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.animation = [
      {
        from: event.fromId,
        tos: [(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).killedBy!],
      },
    ];

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const source = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).killedBy!;
    const response = await room.askForCardDrop(source, 1, [PlayerCardsArea.HandArea], true, undefined, this.Name);

    response.droppedCards.length > 0 &&
      (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, source, source, this.Name));

    return true;
  }
}
