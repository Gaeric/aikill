import { CardType } from '/src/core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { Sanguosha } from '/src/core/game/engine';
import { AllStage, CardUseStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { Room } from '/src/core/room/room';
import { MarkEnum } from '/src/core/shares/types/mark_list';
import { TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'wumou', description: 'wumou_description' })
export class WuMou extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const usedCard = Sanguosha.getCardById(event.cardId);
    return usedCard.is(CardType.Trick) && !usedCard.is(CardType.DelayedTrick) && event.fromId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const options = ['wumou: loseHp'];
    room.getMark(skillUseEvent.fromId, MarkEnum.Wrath) && options.unshift('wumou: loseMark');

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: skillUseEvent.fromId,
      conversation: 'wumou: please choose the cost for your Normal Trick',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      skillUseEvent.fromId,
    );

    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );

    if (selectedOption === 'wumou: loseMark') {
      room.addMark(skillUseEvent.fromId, MarkEnum.Wrath, -1);
    } else {
      await room.loseHp(skillUseEvent.fromId, 1);
    }

    return true;
  }
}
