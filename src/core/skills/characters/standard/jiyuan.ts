import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { AllStage, CardMoveStage, PlayerDyingStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { CommonSkill, TriggerSkill } from '/src/core/skills/skill';

@CommonSkill({ name: 'jiyuan', description: 'jiyuan_description' })
export class JiYuan extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PlayerDyingStage.PlayerDying || stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.MoveCardEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveEvent = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return (
        moveEvent.infos.find(
          info =>
            info.toId !== undefined &&
            info.toId !== owner.Id &&
            info.proposer === owner.Id &&
            info.toArea === PlayerCardsArea.HandArea,
        ) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      return true;
    }
    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const unknownEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.MoveCardEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      const infos =
        moveEvent.infos.length === 1
          ? moveEvent.infos
          : moveEvent.infos.filter(
              info =>
                info.toId !== undefined &&
                info.toId !== skillUseEvent.fromId &&
                info.proposer === skillUseEvent.fromId &&
                info.toArea === PlayerCardsArea.HandArea,
            );

      for (const info of infos) {
        info.toId && (await room.drawCards(1, info.toId, 'top', skillUseEvent.fromId, this.Name));
      }
    } else {
      const dyingEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;
      await room.drawCards(1, dyingEvent.dying, 'top', undefined, this.Name);
    }

    return true;
  }
}
