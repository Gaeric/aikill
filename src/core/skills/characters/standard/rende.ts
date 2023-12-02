import { VirtualCard } from 'src/core/cards/card';
import { CardMatcher } from 'src/core/cards/libs/card_matcher';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { GameCardExtensions } from 'src/core/game/game_props';
import { AllStage, SkillEffectStage } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { CommonSkill, TriggerSkill } from 'src/core/skills/skill';
import { SingleTargetOnceActSkill } from 'src/core/skills/skill_utils';
import { CompulsorySkill, ShadowSkill } from 'src/core/skills/skill_wrappers';

@CommonSkill({ name: 'rende', description: 'rende_description' })
export class RendeGiveCards extends SingleTargetOnceActSkill {
  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.moveCards({
      movingCards: skillUseEvent.cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId: skillUseEvent.fromId,
      toId: skillUseEvent.toIds![0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: skillUseEvent.fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: RendeGiveCards.Name, description: RendeGiveCards.Description })
export class RendeUseCard extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  public isTriggerable(_event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, stage?: AllStage) {
    return stage === SkillEffectStage.AfterSkillEffected;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (event.skillName !== RendeGiveCards.Name || owner.hasUsedSkill(this.Name)) {
      return false;
    }

    const recordEvents = room.Analytics.getRecordEvents<GameEventIdentifiers.SkillUseEvent>(
      event => event.skillName === this.GeneralName,
      owner.Id,
      'round',
    );

    const rendeCardLength = recordEvents.reduce<number>((cardLength, event) => cardLength + event.cardIds!.length, 0);

    console.log(`rendeCardLength is ${rendeCardLength}`);

    return rendeCardLength >= 2;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const from = room.getPlayerById(event.fromId);

    let options: string[] = ['peach', 'alcohol', 'slash'];
    if (room.Info.cardExtensions.includes(GameCardExtensions.LegionFight)) {
      options.push('fire_slash');
      options.push('thunder_slash');
    }

    options = options.filter(cardName => from.canUseCard(room, new CardMatcher({ name: [cardName] })));

    console.log(`render options: ${options}`);

    if (options.length === 0) {
      return true;
    }

    const chooseEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      askedBy: event.fromId,
      conversation: 'please choose a basic card to use',
      toId: event.fromId,
      triggeredBySkills: [this.Name],
    };

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, chooseEvent, event.fromId);
    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      event.fromId,
    );

    if (!response.selectedOption) {
      return true;
    } else if (
      response.selectedOption === 'slash' ||
      response.selectedOption === 'thunder_slash' ||
      response.selectedOption === 'fire_slash'
    ) {
      const targets: PlayerId[] = [];

      for (const player of room.AlivePlayers) {
        if (player === room.CurrentPlayer || !room.canAttack(from, player)) {
          continue;
        }
        targets.push(player.Id);
      }

      const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        players: targets,
        toId: from.Id,
        requiredAmount: 1,
        conversation: 'Please choose your slash target',
        triggeredBySkills: [this.Name],
      };

      room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent, from.Id);

      const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        from.Id,
      );

      if (choosePlayerResponse.selectedPlayers !== undefined) {
        const slashUseEvent = {
          fromId: from.Id,
          cardId: VirtualCard.create({
            cardName: response.selectedOption,
            bySkill: this.Name,
          }).Id,
          targetGroup: [choosePlayerResponse.selectedPlayers],
        };

        await room.useCard(slashUseEvent);
      }
    } else {
      const cardUseEvent = {
        fromId: from.Id,
        cardId: VirtualCard.create({
          cardName: response.selectedOption!,
          bySkill: this.Name,
        }).Id,
      };

      await room.useCard(cardUseEvent);
    }
    return true;
  }
}
