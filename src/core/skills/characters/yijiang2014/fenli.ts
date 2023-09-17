import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { Functional } from 'src/core/shares/libs/functional';
import { TriggerSkill } from 'src/core/skills/skill';
import { CommonSkill } from 'src/core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'src/core/translations/translation_json_tool';

@CommonSkill({ name: 'fenli', description: 'fenli_description' })
export class FenLi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.toPlayer === owner.Id &&
      ((content.to === PlayerPhase.DrawCardStage &&
        room
          .getOtherPlayers(owner.Id)
          .find(
            player =>
              player.getCardIds(PlayerCardsArea.HandArea).length > owner.getCardIds(PlayerCardsArea.HandArea).length,
          ) === undefined) ||
        (content.to === PlayerPhase.PlayCardStage &&
          room.getOtherPlayers(owner.Id).find(player => player.Hp > owner.Hp) === undefined) ||
        (content.to === PlayerPhase.DropCardStage &&
          owner.getCardIds(PlayerCardsArea.EquipArea).length > 0 &&
          room
            .getOtherPlayers(owner.Id)
            .find(
              player =>
                player.getCardIds(PlayerCardsArea.EquipArea).length >
                owner.getCardIds(PlayerCardsArea.EquipArea).length,
            ) === undefined))
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
  ): PatchedTranslationObject | string {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to skip {1} ?',
      this.Name,
      Functional.getPlayerPhaseRawText(event.to),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.skip(
      event.fromId,
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).to,
    );

    return true;
  }
}
