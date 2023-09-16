import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { AllStage, PlayerDiedStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerId } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';
import { MouLi } from './mouli';

@CompulsorySkill({ name: 'zifu', description: 'zifu_description' })
export class ZiFu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.AfterPlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return room.getFlag<PlayerId[]>(content.playerId, MouLi.MouLiLi) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.changeMaxHp(event.fromId, -2);

    return true;
  }
}
