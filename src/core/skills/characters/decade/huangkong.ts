import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { AimStage, AllStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'huangkong', description: 'huangkong_description' })
export class HuangKong extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.toId === owner.Id &&
      room.CurrentPlayer !== owner &&
      owner.getCardIds(PlayerCardsArea.HandArea).length === 0 &&
      (Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' ||
        Sanguosha.getCardById(content.byCardId).isCommonTrick())
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
