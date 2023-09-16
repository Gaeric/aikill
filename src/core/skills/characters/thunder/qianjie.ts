import { CardType } from '/src/core/cards/card';
import { CardMatcher } from '/src/core/cards/libs/card_matcher';
import { CardId } from '/src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { EventPacker } from '/src/core/event/event_packer';
import { Sanguosha } from '/src/core/game/engine';
import { AllStage, ChainLockStage } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerId } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { FilterSkill, TriggerSkill } from '/src/core/skills/skill';
import { CompulsorySkill, ShadowSkill } from '/src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'qianjie', description: 'qianjie_description' })
export class QianJie extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.ChainLockedEvent>, stage?: AllStage): boolean {
    return stage === ChainLockStage.BeforeChainingOn;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.ChainLockedEvent>): boolean {
    return content.toId === owner.Id && content.linked === true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const chainLockedEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.ChainLockedEvent>;
    EventPacker.terminate(chainLockedEvent);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: QianJie.Name, description: QianJie.Description })
export class QianJieShadow extends FilterSkill {
  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    if (cardId instanceof CardMatcher) {
      return !new CardMatcher({ type: [CardType.DelayedTrick] }).match(cardId);
    } else {
      const card = Sanguosha.getCardById(cardId);
      return !card.is(CardType.DelayedTrick);
    }
  }

  public canBePindianTarget(): boolean {
    return false;
  }
}
