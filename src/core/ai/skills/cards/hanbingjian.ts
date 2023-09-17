import { AiLibrary } from 'src/core/ai/ai_lib';
import type { CardId } from 'src/core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import type { Player } from 'src/core/player/player';
import { PlayerCardsArea } from 'src/core/player/player_props';
import type { Room } from 'src/core/room/room';
import type { HanBingJianSkill } from 'src/core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class HanBingJianSkillTrigger extends TriggerSkillTriggerClass<
  HanBingJianSkill,
  GameEventIdentifiers.CardEffectEvent
> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: HanBingJianSkill,
    onEvent?: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> | undefined => {
    if (!onEvent) {
      return;
    }

    const drunkTag = ai.getInvisibleMark('drunk');

    return drunkTag
      ? undefined
      : {
          fromId: ai.Id,
          invoke: skill.Name,
        };
  };

  onAskForChoosingCardFromPlayerEvent = (
    content: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>,
    room: Room,
  ): ClientEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> | undefined => {
    const ai = room.getPlayerById(content.fromId);
    const to = room.getPlayerById(content.toId);

    const handCards = content.options[PlayerCardsArea.HandArea] as number | undefined;
    const equipCards = content.options[PlayerCardsArea.EquipArea] as CardId[] | undefined;

    if (equipCards && equipCards.length > 0) {
      return {
        fromId: ai.Id,
        selectedCard: AiLibrary.sortTargetEquipsInDefense(room, ai, to)[0],
        fromArea: PlayerCardsArea.EquipArea,
      };
    }
    if (handCards !== undefined) {
      const index = Math.floor(Math.random() * handCards);
      return {
        fromId: ai.Id,
        selectedCardIndex: index,
        fromArea: PlayerCardsArea.HandArea,
      };
    }

    return;
  };
}
