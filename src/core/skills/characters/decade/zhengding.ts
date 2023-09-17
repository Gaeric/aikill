import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { Sanguosha } from 'src/core/game/engine';
import { AllStage, CardResponseStage, CardUseStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'zhengding', description: 'zhengding_description' })
export class ZhengDing extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage): boolean {
    return stage === CardUseStage.CardUsing || stage === CardResponseStage.CardResponsing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    if (
      content.fromId !== owner.Id ||
      !content.responseToEvent ||
      room.CurrentPlayer === owner ||
      EventPacker.getIdentifier(content.responseToEvent) !== GameEventIdentifiers.CardEffectEvent
    ) {
      return false;
    }

    const responseToEvent = content.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    return (
      responseToEvent.fromId !== owner.Id &&
      Sanguosha.getCardById(content.cardId).Color === Sanguosha.getCardById(responseToEvent.cardId).Color
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.changeMaxHp(event.fromId, 1);

    return true;
  }
}
