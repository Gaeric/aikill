import { CardType } from 'src/core/cards/card';
import { CharacterEquipSections } from 'src/core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Player } from 'src/core/player/player';
import { Room } from 'src/core/room/room';
import { BaGuaZhenSkill } from 'src/core/skills/cards/standard/baguazhen';
import { CompulsorySkill } from 'src/core/skills/skill_wrappers';

@CompulsorySkill({ name: 'bazhen', description: 'bazhen_description' })
export class BaZhen extends BaGuaZhenSkill {
  public get RelatedCharacters(): string[] {
    return ['pangtong'];
  }

  async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const askForInvoke: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      toId: event.fromId,
      invokeSkillNames: [this.Name],
    };
    room.notify(GameEventIdentifiers.AskForSkillUseEvent, askForInvoke, event.fromId);
    const { invoke } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, event.fromId);
    return invoke !== undefined;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    return (
      super.canUse(room, owner, content) &&
      owner.getEquipment(CardType.Shield) === undefined &&
      owner.canEquipTo(CharacterEquipSections.Shield)
    );
  }
}
