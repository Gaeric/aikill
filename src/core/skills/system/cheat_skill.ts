import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder, WorkPlace } from 'src/core/event/event';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { ActiveSkill } from '../skill';
import { CommonSkill } from '../skill_wrappers';
import { EventPacker } from 'src/core/event/event_packer';
import { Sanguosha } from 'src/core/game/engine';

@CommonSkill({ name: 'cheat_skill', description: 'cheat_skill_description' })
export class CheatSkill extends ActiveSkill {
  public canUse(_room: Room<WorkPlace>, _owner: Player, _containerCard?: CardId | undefined): boolean {
    return true;
  }

  public numberOfTargets(): number | number[] {
    return 0;
  }

  public cardFilter(
    _room: Room<WorkPlace>,
    _owner: Player,
    cards: CardId[],
    _selectedTargets: string[],
    _cardId?: CardId | undefined,
  ): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  async onUse() {
    return true;
  }

  public async onEffect(
    room: Room<WorkPlace>,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const characters = Sanguosha.getAllCharacters().map(character => character.Id);
    room.notify(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      {
        amount: 1,
        characterIds: characters,
        toId: event.fromId,
        byHuaShen: true,
        triggeredBySkills: [this.Name],
        conversation: 'Please choose a character to get a skill',
      },
      event.fromId,
    );

    const { chosenCharacterIds } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      event.fromId,
    );

    const options = Sanguosha.getCharacterById(chosenCharacterIds[0])
      .Skills.filter(skill => !(skill.isShadowSkill() || skill.isLordSkill()))
      .map(skill => skill.GeneralName);

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: event.fromId,
      conversation: 'Please announce a skill',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      event.fromId,
    );

    const chooseResp = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      event.fromId,
    );
    room.obtainSkill(event.fromId, chooseResp.selectedOption!);

    return true;
  }
}
