import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { Sanguosha } from 'src/core/game/engine';
import { AllStage, DamageEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'renshi', description: 'renshi_description' })
export class RenShi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.toId === owner.Id &&
      owner.LostHp > 0 &&
      !!content.cardIds &&
      Sanguosha.getCardById(content.cardIds[0]).GeneralName === 'slash'
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    EventPacker.terminate(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>);

    const damageCard = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).cardIds![0];
    room.isCardOnProcessing(damageCard) &&
      (await room.moveCards({
        movingCards: [{ card: damageCard, fromArea: CardMoveArea.ProcessingArea }],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        triggeredBySkills: [this.Name],
      }));

    await room.changeMaxHp(event.fromId, -1);

    return true;
  }
}
