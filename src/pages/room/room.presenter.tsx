import { Card } from "src/core/cards/card";
import { CardId } from "src/core/cards/libs/card_props";
import { GameEventIdentifiers } from "src/core/event/event";
import type { ServerEventFinder } from "src/core/event/event";
import type { GameInfo } from "src/core/game/game_props";
import { GameCommonRules } from "src/core/game/game_rules";
import { RecordAnalytics } from "src/core/game/record_analytics";
import { ClientSocket } from "src/core/network/socket.client";
import { Player } from "src/core/player/player";
import { ClientPlayer } from "src/core/player/player.client";
import type {
  PlayerId,
  PlayerInfo,
  PlayerShortcutInfo,
} from "src/core/player/player_props";
import type { RoomId } from "src/core/room/room";
import { ClientRoom } from "src/core/room/room.client";
import { RoomEventStacker } from "src/core/room/utils/room_event_stack";
import { Precondition } from "src/core/shares/libs/precondition/precondition";
import { Skill } from "src/core/skills/skill";
import * as React from "react";
import { Point } from "./animations/position";
// import { ClientRoomInfo, DisplayCardProp, RoomStore } from "./room.store";
import {
  Conversation,
  ConversationProps,
} from "./ui/conversation/conversation";
import {
  CardCategoryDialog,
  CardCategoryDialogProps,
} from "./ui/dialog/card_category_dialog/card_category_dialog";
import { AnimationPosition } from "./animations/position";

export type ClientRoomInfo = {
  roomId: number;
  playerName: string;
  socket: ClientSocket;
  timestamp: number;
  playerId: PlayerId;
};
export type DisplayCardProp = {
  card: Card;
  tag?: string;
  buried?: boolean;
  from: Player | undefined;
  to: Player | undefined;
  hiddenMove?: boolean;
  animationPlayed?: boolean;
};
export function RoomPresenter(imageLoader: any) {
  const [clientRoomInfo, setClientRoomInfo] = React.useState<ClientRoomInfo>();
  const [room, setRoom] = React.useState<ClientRoom>();
  const [clientPlayerId, setClientPlayerId] = React.useState<PlayerId>();
  const [selectorDialog, setSelectorDialog] = React.useState<
    JSX.Element | undefined
  >();
  const [selectorViewDialog, setSelectorViewDialog] = React.useState<
    JSX.Element | undefined
  >();
  const [incomingConversation, setIncomingConversation] = React.useState<
    JSX.Element | undefined
  >();
  const [gameLog, setGameLog] = React.useState<(string | JSX.Element)[]>([]);
  const [messageLog, setMessageLog] = React.useState<(string | JSX.Element)[]>(
    []
  );
  const [displayedCards, setDisplayedCards] = React.useState<DisplayCardProp[]>(
    []
  );
  const [displayedCardsAnimationStyles, setDisplayedCardsAnimationStyles] =
    React.useState<{
      [K in CardId]: React.CSSProperties;
    }>({});
  const [canReforge, setCanReforge] = React.useState(false);
  let animationPosition = new AnimationPosition();
  const [actionButtonStatus, setActionButtonStatus] = React.useState<{
    confirm: boolean;
    cancel: boolean;
    finish: boolean;
  }>({ confirm: false, cancel: false, finish: false });
  const [selectedSkill, setSelectedSkill] = React.useState<Skill | undefined>();
  const [awaitingResponseEvent, setAwaitingResponseEvent] = React.useState<{
    identifier?: GameEventIdentifiers;
    event?: ServerEventFinder<GameEventIdentifiers>;
  }>({});
  const [inAction, setInAction] = React.useState<boolean>();
  const [notifiedPlayers, setNotifiedPlayers] = React.useState<PlayerId[]>([]);
  const [numberOfDrawStack, setNumberOfDrawStack] = React.useState<number>();
  const [currentCircle, setCurrentCircle] = React.useState<number>(0);
  const [notificationTime, setNotificationTime] = React.useState<number>(60);
  const [delightedPlayers, setDelightedPlayers] = React.useState<
    boolean | undefined
  >(false);
  const [highlightedCards, setHighlightedCards] = React.useState<
    boolean | undefined
  >(true);
  const [selectedCards, setSelectedCards] = React.useState<CardId[]>([]);
  const [selectedPlayers, setSelectedPlayers] = React.useState<ClientPlayer[]>(
    []
  );
  const [incomingUserMessages, setIncomingUserMessages] = React.useState<{
    [K in PlayerId]: string;
  }>({});
  const [onceSkillUsedHistory, setOnceSkillUsedHistory] = React.useState<{
    [K in PlayerId]: string[];
  }>({});
  const [switchSkillState, setSwitchSkillState] = React.useState<{
    [K in PlayerId]: string[];
  }>({});
  const [clientPlayerHandcardShowMatcher, setClientPlayerHandcardShowMatcher] =
    React.useState<(card: Card) => boolean>();
  const [clientPlayerCardActionsMatcher, setClientPlayerCardActionsMatcher] =
    React.useState<(card: Card) => boolean>();
  const [
    clientPlayerOutsideCardActionsMatcher,
    setClientPlayerOutsideCardActionsMatcher,
  ] = React.useState<(card: Card) => boolean>();
  const [onClickHandCardToPlay, setOnClickHandCardToPlay] = React.useState<
    (card: Card, selected: boolean) => void
  >(() => {});
  const [onClickEquipmentToDoAction, setOnClickEquipmentToDoAction] =
    React.useState<(card: Card, selected: boolean) => void>(() => {});
  const [playersHighlightedMatcher, setPlayersHighlightedMatcher] =
    React.useState<(player: Player) => boolean>();
  const [playersSelectionMatcher, setPlayersSelectionMatcher] =
    React.useState<(player: Player) => boolean>();
  const [cardSkillsSelectionMatcher, setCardSkillsSelectionMatcher] =
    React.useState<(card: Card) => boolean>();
  const [onClickPlayer, setOnClickPlayer] =
    React.useState<(player: Player, selected: boolean) => void>();
  const [onClickSkill, setOnClickSkill] =
    React.useState<(skill: Skill, selected: boolean) => void>();
  const [isSkillDisabled, setIsSkillDisabled] = React.useState<
    (skill: Skill) => boolean
  >(() => () => false);

  const [validSelectionAction, setValidSelectionAction] = React.useState<
    undefined | (() => void)
  >(() => {});
  const [confirmButtonAction, setConfirmButtonAction] = React.useState<
    (() => void) | undefined
  >();
  const [cancelButtonAction, setCancelButtonAction] = React.useState<
    (() => void) | undefined
  >();
  const [finishButtonAction, setFinishButtonAction] = React.useState<
    (() => void) | undefined
  >();

  function getClientPlayer() {
    return room?.getPlayerById(clientPlayerId);
  }

  function broadcastUIUpdate() {}

  function setupRoomStatus(info: ClientRoomInfo) {
    setClientRoomInfo(() => info);
  }

  function setupClientPlayerId(playerId: PlayerId) {
    setClientPlayerId(() => playerId);
  }

  function enableActionButton(...buttons: ("confirm" | "cancel" | "finish")[]) {
    setActionButtonStatus((actionButtonStatus) => {
      buttons.forEach((btn) => (actionButtonStatus[btn] = true));
      return actionButtonStatus;
    });
  }

  function disableActionButton(
    ...buttons: ("confirm" | "cancel" | "finish")[]
  ) {
    setActionButtonStatus((actionButtonStatus) => {
      buttons.forEach((btn) => (actionButtonStatus[btn] = false));
      return actionButtonStatus;
    });
  }

  function playerEnter(playerInfo: PlayerInfo) {
    const player = new ClientPlayer(
      playerInfo.Id,
      playerInfo.Name,
      playerInfo.Position,
      playerInfo.CharacterId,
      undefined,
      playerInfo.Status
    );
    room!.addPlayer(player);
  }

  function playerLeave(playerId: PlayerId, quit?: boolean) {
    if (room!.isPlaying()) {
      room!.getPlayerById(playerId).setOffline(quit);
    } else {
      room!.removePlayer(playerId);
      broadcastUIUpdate();
    }
  }

  function createClientRoom(
    roomId: RoomId,
    socket: ClientSocket,
    gameInfo: GameInfo,
    playersInfo: (PlayerShortcutInfo | PlayerInfo)[]
  ) {
    const players = playersInfo.map((playerInfo) => {
      const player = new ClientPlayer(
        playerInfo.Id,
        playerInfo.Name,
        playerInfo.Position,
        playerInfo.CharacterId,
        undefined,
        playerInfo.Status
      );
      for (const [key, properties] of Object.entries(playerInfo.Flags)) {
        player.setFlag(key, properties.value, key, properties.visiblePlayers);
      }
      for (const [mark, value] of Object.entries(playerInfo.Marks)) {
        player.setMark(mark, value);
      }

      if ("equipSectionsStatus" in playerInfo) {
        const info = playerInfo as PlayerShortcutInfo;
        player.syncUpPlayer(info);
      }

      return player;
    });
    let newRoom = new ClientRoom(
      roomId,
      socket,
      gameInfo,
      players,
      new RecordAnalytics(),
      new GameCommonRules(),
      new RoomEventStacker()
    );
    setRoom(() => newRoom);
    return newRoom;
  }

  function addGameLog(log: string | JSX.Element) {
    setGameLog(() => [...gameLog, log]);
  }

  function addUserMessage(text: string | JSX.Element) {
    setMessageLog(() => [...messageLog, text]);
  }

  function showCards(...cards: DisplayCardProp[]) {
    if (displayedCards.length > 7) {
      const deletedCards: DisplayCardProp[] = [];

      setTimeout(() => {
        setDisplayedCardsAnimationStyles((displayedCardsAnimationStyles) => {
          for (let i = 0; i < 7; i++) {
            const cardInfo = displayedCards[i];
            displayedCardsAnimationStyles[cardInfo.card.Id] =
              displayedCardsAnimationStyles[cardInfo.card.Id] || {};
            displayedCardsAnimationStyles[cardInfo.card.Id].opacity = 0;
            deletedCards.push(cardInfo);
          }

          for (const cardInfo of deletedCards) {
            displayedCardsAnimationStyles[cardInfo.card.Id] = {};
          }
          return displayedCardsAnimationStyles;
        });
        setDisplayedCards((displayedCards) =>
          displayedCards.filter((card) => !deletedCards.includes(card))
        );
      }, 600);
    }

    setDisplayedCards((displayedCards) => [...displayedCards, ...cards]);
  }

  function buryCards(...cards: CardId[]) {
    setDisplayedCards((displayedCards) => {
      for (const cardId of cards) {
        const exist = displayedCards.find((_card) => cardId === _card.card.Id);
        if (exist) {
          exist.buried = true;
        }
      }
      return displayedCards;
    });
  }

  function getCardElementPosition(cardId: CardId): Point {
    const cardElement = document.getElementById(cardId.toString());
    if (!cardElement) {
      return { x: 0, y: 0 };
    }

    const offset =
      displayedCards.length * 120 > 600 ? 300 : displayedCards.length * 60;
    return {
      x: cardElement.getBoundingClientRect().x + offset,
      y: cardElement.getBoundingClientRect().y,
    };
  }

  function playCardAnimation(cardInfo: DisplayCardProp, from?: Point) {
    if (
      cardInfo.animationPlayed ||
      !document.getElementById(cardInfo.card.Id.toString())
    ) {
      return;
    }
    setDisplayedCardsAnimationStyles((displayedCardsAnimationStyles) => {
      displayedCardsAnimationStyles[cardInfo.card.Id] =
        displayedCardsAnimationStyles[cardInfo.card.Id] || {};

      const cardStyle = displayedCardsAnimationStyles[cardInfo.card.Id];
      const originalPosition = getCardElementPosition(cardInfo.card.Id);

      if (from) {
        cardStyle.transition = "unset";
        cardStyle.opacity = 0;
        cardStyle.transform = `translate(${from.x - originalPosition.x}px, ${
          from.y - originalPosition.y
        }px)`;

        setTimeout(() => {
          delete displayedCardsAnimationStyles[cardInfo.card.Id];
          cardInfo.animationPlayed = true;
        }, 100);
      } else {
        delete displayedCardsAnimationStyles[cardInfo.card.Id];
        cardInfo.animationPlayed = true;
      }

      return displayedCardsAnimationStyles;
    });
  }

  function createViewDialog(dialog: JSX.Element) {
    setSelectorViewDialog(() => dialog);
  }

  function closeViewDialog() {
    setSelectorViewDialog(() => undefined);
  }

  function createDialog(dialog: JSX.Element) {
    setSelectorDialog(() => dialog);
  }

  function createCardCategoryDialog(
    props: Pick<
      CardCategoryDialogProps,
      Exclude<keyof CardCategoryDialogProps, "imageLoader">
    >
  ) {
    setSelectorDialog(() => (
      <CardCategoryDialog imageLoader={imageLoader} {...props} />
    ));
  }

  function closeDialog() {
    if (selectorDialog) {
      disableActionButton("cancel");
      setSelectorDialog(() => undefined);
    }
  }

  function createIncomingConversation(props: ConversationProps) {
    if (props.optionsActionHanlder) {
      for (const [option, action] of Object.entries(
        props.optionsActionHanlder
      )) {
        props.optionsActionHanlder[option] = () => {
          closeIncomingConversation();
          action();
        };
      }
    }
    setIncomingConversation(() => <Conversation {...props} />);
  }

  function enableCardReforgeStatus() {
    setCanReforge(() => true);
  }

  function disableCardReforgeStatus() {
    setCanReforge(() => false);
  }

  function closeIncomingConversation() {
    setIncomingConversation(() => undefined);
  }

  function setupClientPlayerCardActionsMatcher(
    matcher: (card: Card) => boolean
  ) {
    setClientPlayerCardActionsMatcher(() => matcher);
  }

  function setupClientPlayerHandardsActionsMatcher(
    matcher: (card: Card) => boolean
  ) {
    setClientPlayerHandcardShowMatcher(() => matcher);
  }

  function setupClientPlayerOutsideCardActionsMatcher(
    matcher: (card: Card) => boolean
  ) {
    setClientPlayerOutsideCardActionsMatcher(() => matcher);
  }

  function onClickPlayerCard(handler: (card: Card, selected: boolean) => void) {
    setOnClickHandCardToPlay(() => handler);
  }

  function onClickEquipment(handler: (card: Card, selected: boolean) => void) {
    setOnClickEquipmentToDoAction(() => handler);
  }

  function setupPlayersHighlightedStatus(matcher: (player: Player) => boolean) {
    setPlayersHighlightedMatcher(() => matcher);
  }

  function setupPlayersSelectionMatcher(matcher: (player: Player) => boolean) {
    setPlayersSelectionMatcher(() => matcher);
  }

  function setupCardSkillSelectionMatcher(matcher: (card: Card) => boolean) {
    setCardSkillsSelectionMatcher(() => matcher);
  }

  function handleOnClickPlayer(
    handler: (player: Player, selected: boolean) => void
  ) {
    setOnClickPlayer(() => handler);
  }

  function handleOnClickSkill(
    handler: (skill: Skill, selected: boolean) => void
  ) {
    setOnClickSkill(() => handler);
  }

  function handleIsSkillDisabled(handler: (skill: Skill) => boolean) {
    setIsSkillDisabled(() => handler);
  }

  function resetSelectedSkill() {
    setSelectedSkill(undefined);
  }
  function handleSelectedSkill(skill: Skill) {
    setSelectedSkill(() => skill);
  }

  function defineConfirmButtonActions(handler: () => void) {
    setConfirmButtonAction(() => () => {
      setActionButtonStatus((data) => ({
        ...data,
        confirm: false,
        cancel: false,
      }));
      setConfirmButtonAction(undefined);
      handler();
    });
  }

  function defineFinishButtonActions(handler: () => void) {
    setActionButtonStatus((data) => ({ ...data, finish: true }));

    setFinishButtonAction(() => () => {
      setActionButtonStatus({
        finish: false,
        confirm: false,
        cancel: false,
      });
      setFinishButtonAction(undefined);
      handler();
    });
  }

  function defineCancelButtonActions(handler: () => void) {
    setCancelButtonAction(() => () => {
      setActionButtonStatus((data) => ({
        ...data,
        confirm: false,
        cancel: false,
      }));
      setCancelButtonAction(undefined);

      handler();
    });
  }

  function endAction() {
    setInAction(() => false);
    setAwaitingResponseEvent({
      identifier: undefined,
      event: undefined,
    });
  }

  function startAction(
    identifier: GameEventIdentifiers,
    event: ServerEventFinder<GameEventIdentifiers>
  ) {
    setInAction(() => true);
    setAwaitingResponseEvent({
      identifier,
      event,
    });
  }

  function clearSelectedCards() {
    setSelectedCards([]);
  }

  function selectCard(card: Card) {
    setSelectedCards((selectedCards) => [...selectedCards, card.Id]);
    return [...selectedCards, card.Id];
  }

  function unselectCard(card: Card) {
    setSelectedCards((selectedCards) =>
      selectedCards.filter((s) => {
        return s !== card.Id;
      })
    );
  }

  function clearSelectedPlayers() {
    setSelectedPlayers([]);
  }

  function selectPlayer(player: ClientPlayer) {
    setSelectedPlayers((selectedPlayers) => [...selectedPlayers, player]);
  }

  function unselectPlayer(player: ClientPlayer) {
    setSelectedPlayers((selectedPlayers) =>
      selectedPlayers.filter((s) => {
        return s !== player;
      })
    );
  }

  function setValidSelectionReflectAction(handler: () => void) {
    setValidSelectionAction(() => handler);
  }

  function clearSelectionReflectAction() {
    setValidSelectionAction(() => undefined);
  }

  function notify(toIds: PlayerId[], notificationTime: number) {
    setNotifiedPlayers((notifiedPlayers) => [...notifiedPlayers, ...toIds]);
    setNotificationTime(() => notificationTime);
  }

  function clearNotifiers() {
    if (notifiedPlayers.length > 0) {
      setNotifiedPlayers([]);
    }
  }

  function updateNumberOfDrawStack(newNumberOfDrawStack: number) {
    if (numberOfDrawStack !== newNumberOfDrawStack || newNumberOfDrawStack) {
      setNumberOfDrawStack(() => newNumberOfDrawStack);
    }
  }

  function updateGameCircle(circle: number) {
    if (circle && circle !== currentCircle) {
      setCurrentCircle(() => circle);
    }
  }

  function delightPlayers(delight?: boolean) {
    setDelightedPlayers(() => delight);
  }

  function highlightCards(highlight?: boolean) {
    setHighlightedCards(() => highlight);
  }

  function onIncomingMessage(player: PlayerId, message?: string) {
    if (message === undefined) {
      setIncomingUserMessages((incomingUserMessages) => {
        delete incomingUserMessages[player];
        return incomingUserMessages;
      });
    } else {
      setIncomingUserMessages((incomingUserMessages) => {
        incomingUserMessages[player] = message;
        return incomingUserMessages;
      });
    }
  }

  function onceSkillUsed(player: PlayerId, skillName: string) {
    setOnceSkillUsedHistory((onceSkillUsedHistory) => {
      if (!onceSkillUsedHistory[player]) {
        onceSkillUsedHistory[player] = [skillName];
      } else {
        onceSkillUsedHistory[player].push(skillName);
      }
      return onceSkillUsedHistory;
    });
  }

  function refreshOnceSkillUsed(player: PlayerId, skillName: string) {
    if (
      onceSkillUsedHistory[player] &&
      onceSkillUsedHistory[player].includes(skillName)
    ) {
      setOnceSkillUsedHistory((onceSkillUsedHistory) => {
        onceSkillUsedHistory[player].filter((o) => {
          return o !== skillName;
        });
        return onceSkillUsedHistory;
      });
    }
  }

  function switchSkillStateChanged(
    player: PlayerId,
    skillName: string,
    initState: boolean = false
  ) {
    setSwitchSkillState((switchSkillState) => {
      if (!switchSkillState[player]) {
        switchSkillState[player] = [skillName];
      } else if (!switchSkillState[player].includes(skillName)) {
        initState || switchSkillState[player].push(skillName);
      } else {
        const index = switchSkillState[player].findIndex(
          (name) => name === skillName
        );
        index !== -1 && switchSkillState[player].splice(index, 1);
      }
      return switchSkillState;
    });
  }

  const store = {
    clientRoomInfo,
    room,
    clientPlayerId,
    selectorDialog,
    selectorViewDialog,
    incomingConversation,
    gameLog,
    messageLog,
    displayedCards,
    displayedCardsAnimationStyles,
    canReforge,
    animationPosition,
    actionButtonStatus,
    selectedSkill,
    awaitingResponseEvent,
    inAction,
    notifiedPlayers,
    numberOfDrawStack,
    currentCircle,
    notificationTime,
    delightedPlayers,
    highlightedCards,
    selectedCards,
    selectedPlayers,
    incomingUserMessages,
    onceSkillUsedHistory,
    switchSkillState,
    clientPlayerCardActionsMatcher,
    clientPlayerOutsideCardActionsMatcher,
    clientPlayerHandcardShowMatcher,
    onClickHandCardToPlay,
    onClickEquipmentToDoAction,
    playersHighlightedMatcher,
    playersSelectionMatcher,
    cardSkillsSelectionMatcher,
    onClickPlayer,
    onClickSkill,
    isSkillDisabled,
    validSelectionAction,
    confirmButtonAction,
    cancelButtonAction,
    finishButtonAction,
  };
  function getStore() {
    return store;
  }
  const newRoomPresent = {
    store,
    getStore,
    getClientPlayer,
    broadcastUIUpdate,
    setupRoomStatus,
    setupClientPlayerId,
    enableActionButton,
    disableActionButton,
    playerEnter,
    playerLeave,
    createClientRoom,
    addGameLog,
    addUserMessage: addUserMessage,
    showCards: showCards,
    buryCards: buryCards,
    getCardElementPosition,
    playCardAnimation,
    createViewDialog,
    closeViewDialog,
    createDialog,
    createCardCategoryDialog,
    closeDialog,
    createIncomingConversation,
    enableCardReforgeStatus,
    disableCardReforgeStatus,
    closeIncomingConversation,
    setupClientPlayerCardActionsMatcher,
    setupClientPlayerHandardsActionsMatcher,
    setupClientPlayerOutsideCardActionsMatcher,
    onClickPlayerCard,
    onClickEquipment,
    setupPlayersHighlightedStatus,
    setupPlayersSelectionMatcher,
    setupCardSkillSelectionMatcher,
    handleOnClickPlayer,
    handleOnClickSkill,
    handleIsSkillDisabled,
    resetSelectedSkill,
    handleSelectedSkill,
    defineConfirmButtonActions,
    defineFinishButtonActions,
    defineCancelButtonActions,
    endAction: endAction,
    startAction: startAction,
    clearSelectedCards,
    selectCard,
    unselectCard,
    clearSelectedPlayers,
    selectPlayer,
    unselectPlayer,
    setValidSelectionReflectAction,
    clearSelectionReflectAction,
    notify,
    clearNotifiers,
    updateNumberOfDrawStack,
    updateGameCircle,
    delightPlayers,
    highlightCards,
    onIncomingMessage,
    onceSkillUsed,
    refreshOnceSkillUsed,
    switchSkillStateChanged,
  };

  return { newRoomPresent };
}
