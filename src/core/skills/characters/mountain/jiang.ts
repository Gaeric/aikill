import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { AimStage, AllStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { CommonSkill, TriggerSkill } from 'src/core/skills/skill';

@CommonSkill({ name: 'jiang', description: 'jiang_description' })
export class JiAng extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    if (!event.byCardId) {
      return false;
    }

    const card = Sanguosha.getCardById(event.byCardId);
    return (
      stage === AimStage.AfterAimmed && ((card.GeneralName === 'slash' && card.isRed()) || card.GeneralName === 'duel')
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return event.fromId === owner.Id || event.toId === owner.Id;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
