import { CardId } from 'src/core/cards/libs/card_props';
import { PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';

export interface ExtralCardSkillProperty {
  isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean;
}
