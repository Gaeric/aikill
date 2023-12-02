import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { AllStage, GameBeginStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea, PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { ActiveSkill } from 'src/core/skills/skill';

export const AfterGameBeganStage = (_: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>, stage?: AllStage) =>
  stage === GameBeginStage.AfterGameBegan;

export class SingleTargetOnceActSkill extends ActiveSkill {
  canUse(room: Room, owner: Player) {
    return true;
  }

  numberOfTargets() {
    return 1;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
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

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return true;
  }
}
