import { PlayerAI } from '/src/core/ai/ai';
import { SmartAI } from '/src/core/ai/smart_ai';
import { TrustAI } from '/src/core/ai/trust_ai';
import { CharacterId } from '/src/core/characters/character';
import { Player } from '/src/core/player/player';
import { GameMode } from '/src/core/shares/types/room_props';
import { PlayerCards, PlayerCardsArea, PlayerCardsOutside, PlayerId, PlayerStatus } from './player_props';

export class ServerPlayer extends Player {
  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
    ai: PlayerAI = TrustAI.Instance,
  ) {
    super(playerCards, playerCharacterId, ai);
  }

  protected status = PlayerStatus.Online;
}

export class SmartPlayer extends ServerPlayer {
  constructor(protected playerPosition: number, gameMode: GameMode) {
    super(`SmartAI-${playerPosition}:${Date.now()}`, 'AI', playerPosition, undefined, undefined, SmartAI.Instance);
    this.delegateOnSmartAI();
  }
}
