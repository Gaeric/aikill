import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, CardMoveStage, StagePriority } from 'src/core/game/stage_processor';
import { SealOnCard, Player, Seal, SealType } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'src/core/skills/skill';
import { AfterGameBeganStage } from 'src/core/skills/skill_utils';
import { CompulsorySkill, ShadowSkill } from 'src/core/skills/skill_wrappers';

// - 霜笳 :: 锁定技，游戏开始时，你的初始手牌增加“胡笳”标记且不计入手牌上限，你每拥有一张“胡笳”，其它角色与你计算距离+1（最多+5）。
@CompulsorySkill({ name: 'shuangjia', description: 'shuangjia_description' })
export class ShuangJia extends TriggerSkill {
  public isTriggerable = AfterGameBeganStage;

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>): boolean {
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

    room.addSeals(event.fromId, seals);
    console.log('seals:');
    console.log(room.getPlayerById(event.fromId).getSeals());

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ShuangJia.Name, description: ShuangJia.Description })
export class ShuangJiaDistance extends RulesBreakerSkill {
  public breakDefenseDistance(room: Room, owner: Player): number {
    const shuangJiaSeals = owner.getSeals().filter(seal => seal.name == ShuangJia.Name);
    console.log(`shuangjua card length: ${shuangJiaSeals.length}`);
    return Math.min(shuangJiaSeals.length, 5);
  }
}

@ShadowSkill
@CompulsorySkill({ name: ShuangJiaDistance.Name, description: ShuangJiaDistance.Description })
export class ShuangJiaRemoveSeal extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
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

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return this.filterShuangJiaSeals(owner, event).length > 0;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    console.log('shuangjia remove seals');
    const moveCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const owner = room.getPlayerById(event.fromId);
    const shuangJiaSeals = this.filterShuangJiaSeals(owner, moveCardEvent);
    room.removeSeals(event.fromId, shuangJiaSeals);
    return true;
  }
}
