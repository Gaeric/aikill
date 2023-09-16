import { VirtualCard } from '/src/core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, PlayerDyingStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { MarkEnum } from '/src/core/shares/types/mark_list';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'shajue', description: 'shajue_description' })
export class ShaJue extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return content.dying !== owner.Id && room.getPlayerById(content.dying).Hp < 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    room.addMark(fromId, MarkEnum.BaoLi, 1);

    const cardIds = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).killedByCards;
    if (
      cardIds &&
      cardIds.length > 0 &&
      VirtualCard.getActualCards(cardIds).length > 0 &&
      room.isCardOnProcessing(cardIds[0])
    ) {
      room.moveCards({
        movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}
