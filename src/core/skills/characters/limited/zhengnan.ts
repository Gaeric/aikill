import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, PlayerDyingStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CommonSkill } from 'src/core/skills/skill_wrappers';
import { TranslationPack } from 'src/core/translations/translation_json_tool';

@CommonSkill({ name: 'zhengnan', description: 'zhengnan_description' })
export class ZhengNan extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['decade_dangxian', 'wusheng', 'zhiman'];
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return !owner.getFlag<PlayerId[]>(this.Name)?.includes(event.dying);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const originalPlayers = room.getFlag<PlayerId[]>(fromId, this.Name) || [];
    originalPlayers.push((event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying);
    room.getPlayerById(fromId).setFlag<PlayerId[]>(this.Name, originalPlayers);

    await room.recover({
      toId: fromId,
      recoveredHp: 1,
      recoverBy: fromId,
    });

    const options = ['decade_dangxian', 'wusheng', 'zhiman'];
    options.filter(skillName => !room.getPlayerById(fromId).hasSkill(skillName));

    await room.drawCards(options.length > 0 ? 1 : 3, fromId, 'top', fromId, this.Name);
    if (options.length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose a skill to gain',
            this.Name,
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedOption = response.selectedOption || options[0];

      await room.obtainSkill(fromId, response.selectedOption);
    }

    return true;
  }
}
