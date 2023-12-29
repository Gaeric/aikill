import { WuXieKeJiSkillTrigger } from 'src/core/ai/skills/cards/wuxiekeji';
import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { EventPacker } from 'src/core/event/event_packer';
import { Room, TimeLimitVariant } from 'src/core/room/room';
import { System } from 'src/core/shares/libs/system';
import { AI, CommonSkill, ResponsiveSkill } from 'src/core/skills/skill';

@AI(WuXieKeJiSkillTrigger)
@CommonSkill({ name: 'wuxiekeji', description: 'wuxiekeji_description' })
export class WuXieKeJiSkill extends ResponsiveSkill {
  public responsiveFor() {
    return new CardMatcher({
      name: ['wuxiekeji'],
    });
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { responseToEvent, toCardIds } = event;

    if (
      !responseToEvent ||
      !toCardIds ||
      EventPacker.getIdentifier(responseToEvent) !== GameEventIdentifiers.CardEffectEvent
    ) {
      return false;
    }

    (responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>).isCancelledOut = true;

    room.doNotify(
      room.AlivePlayers.map(player => player.Id),
      TimeLimitVariant.AskForWuxiekeji,
    );
    await System.MainThread.sleep(1500);

    return true;
  }
}
