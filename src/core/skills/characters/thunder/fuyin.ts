import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea, PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { TargetGroupUtil } from 'src/core/shares/libs/utils/target_group';
import { TriggerSkill } from 'src/core/skills/skill';
import { OnDefineReleaseTiming } from 'src/core/skills/skill_hooks';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'fuyin', description: 'fuyin_description' })
export class FuYin extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, player: Player) {
    room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
      event =>
        TargetGroupUtil.getRealTargets(event.targetGroup)?.includes(player.Id) &&
        (Sanguosha.getCardById(event.cardId).GeneralName === 'slash' ||
          Sanguosha.getCardById(event.cardId).GeneralName === 'duel'),
      undefined,
      'round',
    ).length > 0 && player.setFlag<boolean>(this.Name, true);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    if (owner.getFlag<boolean>(this.Name)) {
      return false;
    }

    const canUse =
      content.toId === owner.Id &&
      content.byCardId !== undefined &&
      (Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' ||
        Sanguosha.getCardById(content.byCardId).GeneralName === 'duel');
    canUse && owner.setFlag<boolean>(this.Name, true);

    return (
      canUse &&
      room.getPlayerById(content.fromId).getCardIds(PlayerCardsArea.HandArea).length >=
        owner.getCardIds(PlayerCardsArea.HandArea).length
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    aimEvent.nullifiedTargets.push(event.fromId);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: FuYin.Name, description: FuYin.Description })
export class FuYinRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish && owner.getFlag<boolean>(this.GeneralName) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
