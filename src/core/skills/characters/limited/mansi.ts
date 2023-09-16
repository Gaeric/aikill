import { VirtualCard } from '/src/core/cards/card';
import { CardMatcher } from '/src/core/cards/libs/card_matcher';
import { CardId } from '/src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from '/src/core/event/event';
import { Sanguosha } from '/src/core/game/engine';
import { AllStage, DamageEffectStage, PlayerPhase } from '/src/core/game/stage_processor';
import { Player } from '/src/core/player/player';
import { PlayerCardsArea } from '/src/core/player/player_props';
import { Room } from '/src/core/room/room';
import { Precondition } from '/src/core/shares/libs/precondition/precondition';
import { TriggerSkill, ViewAsSkill } from '/src/core/skills/skill';
import { CommonSkill, ShadowSkill } from '/src/core/skills/skill_wrappers';

@CommonSkill({ name: 'mansi', description: 'mansi_description' })
export class ManSi extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player, selectedCards?: CardId[], cardMatcher?: CardMatcher): string[] {
    return cardMatcher ? [] : ['nanmanruqing'];
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase): boolean {
    return phase === PlayerPhase.PlayCardStage;
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      !owner.hasUsedSkill(this.Name) &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      owner.canUseCard(
        room,
        new CardMatcher({
          name: ['nanmanruqing'],
        }),
      )
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown mansi card');
    return VirtualCard.create(
      {
        cardName: 'nanmanruqing',
        bySkill: this.Name,
      },
      owner.getCardIds(PlayerCardsArea.HandArea),
    );
  }
}

@ShadowSkill
@CommonSkill({ name: 'manyi', description: 'manyi_description' })
export class ManSiShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return !!event.cardIds && Sanguosha.getCardById(event.cardIds[0]).GeneralName === 'nanmanruqing';
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
