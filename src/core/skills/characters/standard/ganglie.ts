import { CardChoosingOptions } from 'src/core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { DamageType } from 'src/core/game/game_props';
import { AllStage, DamageEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { CommonSkill, TriggerSkill } from 'src/core/skills/skill';

@CommonSkill({ name: 'ganglie', description: 'ganglie_description' })
export class GangLie extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const judge = await room.judge(skillUseEvent.fromId, undefined, this.Name);

    const { triggeredOnEvent } = skillUseEvent;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const damageFrom = fromId && room.getPlayerById(fromId);
    if (!damageFrom || damageFrom.Dead) {
      return false;
    }

    if (Sanguosha.getCardById(judge.judgeCardId).isBlack()) {
      if (damageFrom.getPlayerCards().length === 0) {
        return false;
      }

      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: damageFrom.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: damageFrom.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: skillUseEvent.fromId,
        toId: damageFrom.Id,
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, true, true);
      if (!response) {
        return false;
      }

      await room.dropCards(
        CardMoveReason.PassiveDrop,
        [response.selectedCard!],
        chooseCardEvent.toId,
        skillUseEvent.fromId,
        this.Name,
      );
    } else if (Sanguosha.getCardById(judge.judgeCardId).isRed()) {
      await room.damage({
        fromId: skillUseEvent.fromId,
        damage: 1,
        damageType: DamageType.Normal,
        toId: damageFrom.Id,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}
