import classNames from "classnames";
import { Card, VirtualCard } from "src/core/cards/card";
import { EquipCard } from "src/core/cards/equip_card";
import { CardId } from "src/core/cards/libs/card_props";
import { Sanguosha } from "src/core/game/engine";
import { PlayerPhase } from "src/core/game/stage_processor";
import { Player } from "src/core/player/player";
import { ClientPlayer } from "src/core/player/player.client";
import { PlayerCardsArea } from "src/core/player/player_props";
import { Functional } from "src/core/shares/libs/functional";
import { Skill } from "src/core/skills/skill";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import { RoomPresenter } from "src/pages/room/room.presenter";
import { RoomStore } from "src/pages/room/room.store";
import * as React from "react";
import { CharacterSkinInfo } from "src/skins/skins";
import { PlayerPhaseBadge } from "src/ui/badge/badge";
import { AutoButton } from "src/ui/button/auto_button";
import { Button } from "src/ui/button/button";
import { ClientCard } from "src/ui/card/card";
import { AbortedCardItem } from "./aborted_card_item/aborted_card_item";
import styles from "./dashboard.module.css";
import { EquipCardItem } from "./equip_card_item/equip_card_item";
import armorSlot from "./images/armor.png";
import defenseHorseSlot from "./images/defense_horse.png";
import offenseHorseSlot from "./images/offense_horse.png";
import weaponSlot from "./images/weapon.png";
import { DelayedTrickIcon } from "../icon/delayed_trick_icon";
import { JudgeAreaDisabledIcon } from "../icon/judge_area_disabled_icon";
import { PlayerAvatar } from "../player_avatar/player_avatar";
import { PlayingBar } from "../playing_bar/playing_bar";

export type DashboardProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  skinData?: CharacterSkinInfo[];
  observerMode: boolean;
  playerSelectableMatcher?(player: Player): boolean;
  onClickPlayer?(player: Player, selected: boolean): void;
  handcardHiddenMatcher?(card: Card): boolean;
  cardEnableMatcher?(card: Card): boolean;
  outsideCardEnableMatcher?(card: Card): boolean;
  cardSkillEnableMatcher?(card: Card): boolean;
  onClick?(card: Card, selected: boolean): void;
  onClickEquipment?(card: Card, selected: boolean): void;
  onClickConfirmButton?(): void;
  onClickReforgeButton?(): void;
  onClickCancelButton?(): void;
  onClickFinishButton?(): void;
  onTrusted?(): void;
  onClickSkill?(skill: Skill, selected: boolean): void;
  isSkillDisabled(skill: Skill): boolean;
};

export function Dashboard(props: DashboardProps) {
  let onClick = (card: Card) => (selected: boolean) => {
    props.onClick && props.onClick(card, selected);
  };
  let onClickEquipment = (card: Card) => (selected: boolean) => {
    props.onClickEquipment && props.onClickEquipment(card, selected);
  };

  const [cardOffset, setCardOffset] = React.useState(0);

  const [onFocusCardIndex, setOnFocusCardIndex] = React.useState(-1);

  let handBoardRef = React.createRef<HTMLDivElement>();
  const handCardWidth = 120;
  const cardMargin = 2;

  const { presenter } = props;
  const numOfHandCards =
    presenter.getClientPlayer().getCardIds(PlayerCardsArea.HandArea).length +
    AvailableOutsideCards.length;
  React.useEffect(() => {
    if (handBoardRef.current && presenter.getClientPlayer()) {
      const width = handBoardRef.current.clientWidth - 35;
      if (width < numOfHandCards * (handCardWidth + cardMargin)) {
        setCardOffset(
          -(numOfHandCards * (handCardWidth + cardMargin) - width) /
            (numOfHandCards - 1)
        );
      } else {
        setCardOffset(cardMargin);
      }
    }
  });

  function getEquipCardsSection() {
    const equipCards = props.presenter
      .getClientPlayer()
      ?.getCardIds(PlayerCardsArea.EquipArea)
      .map((cardId) => Sanguosha.getCardById<EquipCard>(cardId));

    const abortedSections =
      props.presenter.getClientPlayer()?.DisabledEquipSections;

    return (
      <div className={styles.equipSection}>
        <div className={styles.equipSlots}>
          <img className={styles.weaponSlot} src={weaponSlot} alt="" />
          <img className={styles.armorSlot} src={armorSlot} alt="" />
          <img
            className={styles.defenseHorseSlot}
            src={defenseHorseSlot}
            alt=""
          />
          <img
            className={styles.offenseHorseSlot}
            src={offenseHorseSlot}
            alt=""
          />
        </div>
        {equipCards?.map((card) => (
          <EquipCardItem
            imageLoader={props.imageLoader}
            translator={props.translator}
            card={card}
            key={card.Id}
            onClick={onClickEquipment(card)}
            disabled={
              !props.cardSkillEnableMatcher ||
              !props.cardSkillEnableMatcher(card)
            }
            highlight={props.store.highlightedCards}
          />
        ))}
        {abortedSections?.map((section) => (
          <AbortedCardItem
            key={section}
            imageLoader={props.imageLoader}
            abortedSection={section}
          />
        ))}
      </div>
    );
  }

  function AvailableOutsideCards() {
    if (!props.outsideCardEnableMatcher || !props.presenter.getClientPlayer()) {
      return [];
    }

    const availableCards: { areaName; card: Card }[] = [];
    for (const [areaName, cards] of Object.entries(
      props.presenter.getClientPlayer().getOutsideAreaCards()
    )) {
      if (props.presenter.getClientPlayer().isCharacterOutsideArea(areaName)) {
        continue;
      }
      availableCards.push(
        ...cards
          .filter((card) =>
            props.outsideCardEnableMatcher!(Sanguosha.getCardById(card))
          )
          .map((cardId) => ({
            areaName,
            card: Sanguosha.getCardById(cardId),
          }))
      );
    }

    return availableCards;
  }

  function getHandCardTags(cardId: CardId) {
    if (!props.presenter.getClientPlayer()) {
      return;
    }

    const cardTags: string[] = [];
    for (const [cardTag, cardIds] of Object.entries(
      props.presenter.getClientPlayer().getAllCardTags()
    )) {
      cardIds.includes(VirtualCard.getActualCards([cardId])[0]) &&
        cardTags.push(cardTag);
    }

    if (Sanguosha.getCardById(cardId).isVirtualCard()) {
      const generatedSkill =
        Sanguosha.getCardById<VirtualCard>(cardId).GeneratedBySkill;
      cardTags.includes(generatedSkill) || cardTags.push(generatedSkill);
    }

    return cardTags.length > 0 ? cardTags : undefined;
  }

  function getCardXOffset(index: number) {
    let offsetX = index * (handCardWidth + cardOffset);
    if (
      cardOffset !== cardMargin &&
      onFocusCardIndex >= 0 &&
      index > onFocusCardIndex
    ) {
      offsetX = index * (handCardWidth + cardOffset) - cardOffset + cardMargin;
    }
    return offsetX;
  }

  function onFocusCard(index: number) {
    setOnFocusCardIndex(index);
  }

  function AllClientHandCards() {
    const outsideCards = AvailableOutsideCards().map((cardInfo, index) => {
      const isSelected = props.store.selectedCards.includes(cardInfo.card.Id);
      const isDisabled =
        !props.outsideCardEnableMatcher ||
        !props.outsideCardEnableMatcher(cardInfo.card);
      return (
        <ClientCard
          imageLoader={props.imageLoader}
          key={cardInfo.card.Id}
          width={handCardWidth}
          offsetLeft={getCardXOffset(index)}
          translator={props.translator}
          card={cardInfo.card}
          highlight={props.store.highlightedCards}
          onMouseEnter={
            isSelected || isDisabled ? undefined : () => onFocusCard(index)
          }
          onMouseLeave={() => onFocusCard(-2)}
          onSelected={onClick(cardInfo.card)}
          tags={[props.translator.tr(cardInfo.areaName)]}
          className={styles.handCard}
          disabled={isDisabled}
          selected={isSelected}
        />
      );
    });

    const handcards =
      props.presenter
        .getClientPlayer()
        ?.getCardIds(PlayerCardsArea.HandArea)
        .filter(
          (cardId) =>
            !props.handcardHiddenMatcher ||
            !props.handcardHiddenMatcher(Sanguosha.getCardById(cardId))
        )
        .map((cardId, index) => {
          const card = Sanguosha.getCardById(cardId);
          const isSelected = props.store.selectedCards.includes(card.Id);
          const isDisabled =
            !props.cardEnableMatcher || !props.cardEnableMatcher(card);
          return (
            <ClientCard
              imageLoader={props.imageLoader}
              key={cardId}
              width={handCardWidth}
              offsetLeft={getCardXOffset(index + outsideCards.length)}
              translator={props.translator}
              onMouseEnter={
                isSelected || isDisabled
                  ? undefined
                  : () => onFocusCard(index + outsideCards.length)
              }
              onMouseLeave={() => onFocusCard(-2)}
              card={!props.observerMode ? card : undefined}
              tags={getHandCardTags(cardId)}
              highlight={props.store.highlightedCards}
              onSelected={onClick(card)}
              className={styles.handCard}
              disabled={isDisabled}
              selected={isSelected}
            />
          );
        }) || [];
    return [...outsideCards, ...handcards];
  }

  function getPlayerJudgeCards() {
    const judgeAreaDisabled = props.presenter
      .getClientPlayer()
      ?.judgeAreaDisabled();

    return (
      <div className={styles.judges}>
        {judgeAreaDisabled ? <JudgeAreaDisabledIcon /> : <></>}
        {props.presenter
          .getClientPlayer()
          ?.getCardIds(PlayerCardsArea.JudgeArea)
          .map((cardId) => (
            <DelayedTrickIcon
              key={cardId}
              imageLoader={props.imageLoader}
              card={Sanguosha.getCardById(cardId)}
              translator={props.translator}
              className={styles.judgeNames}
            />
          ))}
      </div>
    );
  }

  function getPlayerHandBoard() {
    const buttons = (
      <>
        {(props.store.actionButtonStatus.finish ||
          props.store.actionButtonStatus.cancel ||
          props.store.actionButtonStatus.confirm) && (
          <AutoButton
            variant="confirm"
            disabled={!props.store.actionButtonStatus.confirm}
            onClick={props.onClickConfirmButton}
          />
        )}
        {props.store.actionButtonStatus.cancel && (
          <AutoButton
            variant="cancel"
            disabled={!props.store.actionButtonStatus.cancel}
            onClick={props.onClickCancelButton}
          />
        )}
        {props.store.actionButtonStatus.finish && (
          <AutoButton
            variant="finish"
            disabled={!props.store.actionButtonStatus.finish}
            onClick={props.onClickFinishButton}
          />
        )}
      </>
    );
    return (
      <div className={styles.handBoard} ref={handBoardRef}>
        {props.store.inAction && (
          <PlayingBar
            className={styles.playBar}
            playTime={props.store.notificationTime}
          />
        )}
        {getPlayerJudgeCards()}
        <div className={styles.userActionsButtons}>
          {!props.observerMode && buttons}
        </div>
        <div className={styles.handCards}>
          {AllClientHandCards()}
          <div
            className={classNames(styles.trustedCover, {
              [styles.hide]: !props.presenter.getClientPlayer().isTrusted(),
            })}
          >
            {props.translator.tr("in trusted")}
          </div>
        </div>
      </div>
    );
  }

  const onCloseIncomingMessage = (player: Player) => () => {
    props.presenter.onIncomingMessage(player.Id);
    // forceUpdate();
  };

  let onTrusted = () => {
    const player = props.presenter.getClientPlayer();
    if (player.isTrusted()) {
      props.store.room.emitStatus("player", player.Id);
    } else {
      props.store.room.emitStatus("trusted", player.Id);
      props.onTrusted?.();
    }
  };

  let onSortHandcards = () => {
    const handcards =
      props.presenter.getClientPlayer()?.getCardIds(PlayerCardsArea.HandArea) ||
      [];
    props.presenter
      .getClientPlayer()
      ?.setupCards(PlayerCardsArea.HandArea, Functional.sortCards(handcards));
    props.presenter.broadcastUIUpdate();
  };

  let onReverseSelectCards = () => {
    const handcards =
      props.presenter.getClientPlayer()?.getCardIds(PlayerCardsArea.HandArea) ||
      [];
    for (const cardId of handcards) {
      const card = Sanguosha.getCardById(cardId);

      if (props.store.selectedCards.includes(cardId)) {
        props.presenter.unselectCard(card);
      } else {
        props.presenter.selectCard(card);
      }
    }
    props.store.validSelectionAction?.();
  };

  let onSelectTips = () => {
    const handcards =
      props.presenter.getClientPlayer()?.getCardIds(PlayerCardsArea.HandArea) ||
      [];

    if (props.store.selectedCards.length === 0) {
      for (const cardId of handcards) {
        const card = Sanguosha.getCardById(cardId);
        const isDisabled =
          !props.cardEnableMatcher || !props.cardEnableMatcher(card);
        if (!isDisabled) {
          props.onClick && props.onClick(card, true);
        }
      }
    } else {
      for (const cardId of handcards) {
        const card = Sanguosha.getCardById(cardId);
        props.onClick && props.onClick(card, false);
      }
    }
  };

  function createShortcutButtons(player: ClientPlayer) {
    const buttonDisabled =
      !props.store.room.isPlaying() ||
      props.store.room.isGameOver() ||
      props.observerMode;

    return (
      <div className={styles.actionButtons}>
        <Button
          variant="primary"
          className={styles.actionButton}
          onClick={onTrusted}
          disabled={buttonDisabled}
        >
          {props.translator.tr(
            player.isTrusted() ? "cancel trusted" : "trusted"
          )}
        </Button>
        <Button
          variant="primary"
          className={styles.actionButton}
          onClick={onSortHandcards}
          disabled={buttonDisabled}
        >
          {props.translator.tr("adjust handcards")}
        </Button>
        <Button
          variant="primary"
          className={styles.actionButton}
          onClick={onReverseSelectCards}
          disabled={
            buttonDisabled ||
            props.store.room.CurrentPlayer !== player ||
            props.store.room.CurrentPlayerPhase !== PlayerPhase.DropCardStage
          }
        >
          {props.translator.tr("reverse select")}
        </Button>
        <Button
          variant="primary"
          className={styles.actionButton}
          onClick={onSelectTips}
          disabled={
            !props.store.room.isPlaying() || props.store.room.isGameOver()
          }
        >
          {props.translator.tr("select tips")}
        </Button>
      </div>
    );
  }

  const player = props.presenter.getClientPlayer();
  return (
    <div className={styles.dashboard} id={props.store.clientPlayerId}>
      {createShortcutButtons(player)}
      {getEquipCardsSection()}

      {props.store.room.CurrentPlayer === player &&
        props.store.room.CurrentPlayerPhase !== undefined && (
          <PlayerPhaseBadge
            stage={props.store.room.CurrentPlayerPhase}
            translator={props.translator}
            className={styles.playerPhaseStage}
          />
        )}
      {getPlayerHandBoard()}
      <PlayerAvatar
        imageLoader={props.imageLoader}
        delight={
          props.store.delightedPlayers !== undefined
            ? props.store.delightedPlayers
            : undefined
        }
        disabled={
          !props.playerSelectableMatcher ||
          !props.playerSelectableMatcher(player)
        }
        onClick={props.onClickPlayer}
        store={props.store}
        skinData={props.skinData}
        presenter={props.presenter}
        translator={props.translator}
        onClickSkill={props.onClickSkill}
        isSkillDisabled={props.isSkillDisabled}
        incomingMessage={props.store.incomingUserMessages[player.Id]}
        onCloseIncomingMessage={onCloseIncomingMessage(player)}
        selected={props.store.selectedPlayers.includes(player)}
      />
    </div>
  );
}
