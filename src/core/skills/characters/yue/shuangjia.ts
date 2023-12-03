import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder, WorkPlace } from 'src/core/event/event';
import { AllStage, CardMoveStage, StagePriority } from 'src/core/game/stage_processor';
import { SealOnCard, Player, Seal, SealType, SealMethod } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'src/core/skills/skill';
import { AfterGameBeganStage, ExcludeHandCard } from 'src/core/skills/skill_utils';
import { CompulsorySkill, ShadowSkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'shuangjia', description: 'shuangjia_description' })
export class ShuangJia extends TriggerSkill {
  public isTriggerable = AfterGameBeganStage;

  public canUse(): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardIds = room.getPlayerById(event.fromId).getCardIds();
    const seals: Seal[] = cardIds.map(cardId => ({
      name: this.GeneralName,
      binding: { kind: SealType.CardSeal, cardId },
    }));

    room.changeSeals(event.fromId, seals, SealMethod.Add);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ShuangJia.Name, description: ShuangJia.Description })
export class ShuangJiaRemoveSeal extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  isTriggerable(_event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  getPriority() {
    return StagePriority.High;
  }

  filterShuangJiaSeals(owner: Player, event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    const allMoveCardIds = event.infos.reduce((cardIds: CardId[], info) => {
      const ids = info.movingCards.map(card => card.card);
      cardIds = cardIds.concat(ids);
      return cardIds;
    }, []);

    // info => info.movingCards.map(card => card.card);
    const shuangJiaSeals = owner
      .getSeals()
      .filter(
        seal =>
          seal.name == ShuangJia.Name &&
          seal.binding.kind === SealType.CardSeal &&
          allMoveCardIds.find(cardId => (seal.binding as SealOnCard).cardId === cardId),
      );

    return shuangJiaSeals;
  }

  canUse(_room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return this.filterShuangJiaSeals(owner, event).length > 0;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const moveCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const owner = room.getPlayerById(event.fromId);
    const shuangJiaSeals = this.filterShuangJiaSeals(owner, moveCardEvent);
    room.changeSeals(event.fromId, shuangJiaSeals, SealMethod.Remove);
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ShuangJiaRemoveSeal.Name, description: ShuangJiaRemoveSeal.Description })
export class ShuangJiaDistance extends RulesBreakerSkill {
  public breakDefenseDistance(_room: Room, owner: Player): number {
    const shuangJiaSeals = owner.getSeals().filter(seal => seal.name == ShuangJia.Name);
    return Math.min(shuangJiaSeals.length, 5);
  }
}

@ShadowSkill
@CompulsorySkill({ name: ShuangJiaDistance.Name, description: ShuangJiaDistance.Description })
export class ShuangJiaHoldCard extends ExcludeHandCard {
  protected calcHoldCardIds(
    room: Room<WorkPlace>,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): CardId[] {
    const owner = room.getPlayerById(event.fromId);
    let shunagJiaCardIds = owner
      .getSeals()
      .filter(seal => seal.name == ShuangJia.Name && seal.binding.kind === SealType.CardSeal)
      .map(seal => (seal.binding as SealOnCard).cardId);

    return shunagJiaCardIds;
  }
}
