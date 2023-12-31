import { BingLiangCunDuanSkillTrigger } from 'src/core/ai/skills/cards/bingliangcunduan';
import { CardId } from 'src/core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'src/core/event/event';
import { Sanguosha } from 'src/core/game/engine';
import { PlayerPhase } from 'src/core/game/stage_processor';
import { Player } from 'src/core/player/player';
import { PlayerCardsArea, PlayerId } from 'src/core/player/player_props';
import { Room } from 'src/core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'src/core/shares/libs/judge_matchers';
import { Precondition } from 'src/core/shares/libs/precondition/precondition';
import { ActiveSkill, AI, CommonSkill } from 'src/core/skills/skill';
import { TranslationPack } from 'src/core/translations/translation_json_tool';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@AI(BingLiangCunDuanSkillTrigger)
@CommonSkill({ name: 'bingliangcunduan', description: 'bingliangcunduan_description' })
export class BingLiangCunDuanSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse(room: Room, owner: Player) {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }

  public isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    const from = room.getPlayerById(owner);
    const to = room.getPlayerById(target);

    return (
      owner !== target &&
      from.canUseCardTo(room, containerCard, target) &&
      to
        .getCardIds(PlayerCardsArea.JudgeArea)
        .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'bingliangcunduan') === undefined
    );
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return (
      this.isCardAvailableTarget(owner, room, target, selectedCards, selectedTargets, containerCard) &&
      room.cardUseDistanceBetween(room, containerCard, room.getPlayerById(owner), room.getPlayerById(target)) <=
        Sanguosha.getCardById(containerCard).EffectUseDistance
    );
  }

  public async onUse() {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;
    const to = Precondition.exists(toIds, 'Unknown targets in bingliangcunduan')[0];
    const judgeEvent = await room.judge(to, cardId, this.Name, JudgeMatcherEnum.BingLiangCunDuan);
    const card = Sanguosha.getCardById(judgeEvent.judgeCardId);

    if (JudgeMatcher.onJudge(judgeEvent.judgeMatcherEnum!, card)) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} skipped draw stage',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(to)),
        ).extract(),
      });

      await room.skip(to, PlayerPhase.DrawCardStage);
    }
    return true;
  }
}
