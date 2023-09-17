import { CardSuit } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { Sanguosha } from 'src/core/game/engine';
import { AllStage, DamageEffectStage, JudgeEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { TriggerSkill } from 'src/core/skills/skill';
import { CommonSkill } from 'src/core/skills/skill_wrappers';

@CommonSkill({ name: 'decade_yinshi', description: 'decade_yinshi_description' })
export class DecadeYinShi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect || stage === JudgeEffectStage.AfterJudgeEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.JudgeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        damageEvent.toId === owner.Id &&
        (!damageEvent.cardIds || Sanguosha.getCardById(damageEvent.cardIds[0]).Suit === CardSuit.NoSuit)
      );
    } else if (identifier === GameEventIdentifiers.JudgeEvent) {
      const judgeEvent = content as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
      return judgeEvent.toId === owner.Id && room.isCardOnProcessing(judgeEvent.realJudgeCardId);
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    return true;
  }
}
