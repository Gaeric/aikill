import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'lianzhou', description: 'lianzhou_description' })
export class LianZhou extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.getPlayerById(event.fromId).ChainLocked || (await room.chainedOn(event.fromId));

    const targets = room.AlivePlayers.filter(
      player => player.Hp === room.getPlayerById(event.fromId).Hp && !player.ChainLocked,
    ).map(player => player.Id);
    if (targets.length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: targets,
          toId: event.fromId,
          requiredAmount: [1, targets.length],
          conversation: 'lianzhou: do you want to choose targets to chain on?',
          triggeredBySkills: [this.Name],
        },
        event.fromId,
      );

      if (response.selectedPlayers && response.selectedPlayers.length > 0) {
        for (const player of response.selectedPlayers) {
          room.getPlayerById(player).ChainLocked || (await room.chainedOn(player));
        }
      }
    }

    return true;
  }
}
