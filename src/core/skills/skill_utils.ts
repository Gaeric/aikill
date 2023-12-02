import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, CardMoveStage, GameBeginStage, PlayerPhase, SkillEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea, PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { ActiveSkill, TriggerSkill } from 'src/core/skills/skill';
import { EventPacker } from '../event/event_packer';

export const AfterGameBeganStage = (_: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>, stage?: AllStage) =>
  stage === GameBeginStage.AfterGameBegan;

export class SingleTargetOnceActSkill extends ActiveSkill {
  canUse(_room: Room, _owner: Player) {
    return true;
  }

  numberOfTargets() {
    return 1;
  }

  cardFilter(_room: Room, _owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const recordEvents = room.Analytics.getRecordEvents<GameEventIdentifiers.SkillUseEvent>(
      event => event.skillName === this.Name,
      owner,
      'round',
    );
    let onceTarget = true;

    if (recordEvents.length > 0) {
      onceTarget = recordEvents.find(event => target === event.toIds![0]) === undefined;
    }
    return owner !== target && onceTarget;
  }

  isAvailableCard(_owner: PlayerId, _room: Room, _cardId: CardId): boolean {
    return true;
  }

  availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  async onUse(_room: Room, _event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(_room: Room, _skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return true;
  }
}

export abstract class ExcludeHandCard extends TriggerSkill {
  protected abstract calcHoldCardIds(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): CardId[];

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, _stage?: AllStage | undefined): boolean {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent;
  }

  public canUse(
    room: Room,
    owner: Player,
    _content: ServerEventFinder<GameEventIdentifiers>,
    _stage?: AllStage | undefined,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.DropCardStage && room.CurrentPhasePlayer.Id === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const holdCardIds = this.calcHoldCardIds(room, event);

    const askForCardDropEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
    (askForCardDropEvent.cardAmount as number) -= holdCardIds.length;
    askForCardDropEvent.except = askForCardDropEvent.except
      ? [...askForCardDropEvent.except, ...holdCardIds]
      : holdCardIds;

    return true;
  }
}

export abstract class EffectHookSkill extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(_event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, stage?: AllStage) {
    return stage === SkillEffectStage.AfterSkillEffected;
  }

  public abstract canUse(
    _room: Room,
    _owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): boolean;

  public async onTrigger() {
    return true;
  }

  public abstract onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean>;
}
