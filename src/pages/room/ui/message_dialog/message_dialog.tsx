import classNames from "classnames";
import { GameEventIdentifiers } from "src/core/event/event";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { RoomPresenter } from "src/pages/room/room.presenter";
import { RoomStore } from "src/pages/room/room.store";
import * as React from "react";
import { ConnectionService } from "src/services/connection_service/connection_service";
import { Button } from "src/ui/button/button";
import { Input } from "src/ui/input/input";
import styles from "./message_dialog.module.css";
import {
  createRawQuickMessage,
  quickMessageMaxIndex,
} from "./message_dialog.static";

export type MessageDialogProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  connectionService: ConnectionService;
  replayMode?: boolean;
  className?: string;
  fixedHeight: number;
};

const tabOptions: ["room", "lobby"] = ["room", "lobby"];
const Tab = ({
  onClickTab,
  translator,
  defaultTab,
  hasIncomingMessage,
}: {
  onClickTab(tab: "room" | "lobby"): void;
  translator: ClientTranslationModule;
  defaultTab: "room" | "lobby";
  hasIncomingMessage: boolean;
}) => {
  const onTab = (tab: "room" | "lobby") => () => {
    setTab(tab);
    onClickTab(tab);
  };

  const [selectedTab, setTab] = React.useState<"room" | "lobby">(defaultTab);
  return (
    <div className={styles.tabs}>
      {tabOptions.map((tab) => (
        <span
          key={tab}
          className={classNames(styles.tab, {
            [styles.selected]: tab === selectedTab,
            [styles.new]: hasIncomingMessage && tab === "lobby",
          })}
          onClick={onTab(tab)}
        >
          {translator.tr(tab)}
        </span>
      ))}
      <span className={styles.spacer} />
    </div>
  );
};

export function MessageDialog(props: MessageDialogProps) {
  let userMessageDialogElementRef = React.useRef<HTMLDivElement>();
  let textMessageMinHeight = 160;

  const [currentTab, setCurrentTab] = React.useState<"room" | "lobby">("room");
  const [incomingMessage, setIncomingMessage] = React.useState(false);

  const [hideQuickChatItems, setHideQuickChatItems] = React.useState(true);
  const [textMessage, setTextMessage] = React.useState<string | undefined>();
  const [chatMessages, setChatMessages] = React.useState<JSX.Element[]>([]);

  let onMessageChange = (value?: string) => {
    setTextMessage(value);
  };

  let onClickSendButton = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentTab === "room") {
      !props.replayMode &&
        props.store.room.broadcast(GameEventIdentifiers.UserMessageEvent, {
          message: textMessage!,
          playerId: props.presenter.getClientPlayer().Id,
        });
    } else {
      props.connectionService.Chat.send(
        textMessage!,
        props.presenter.getClientPlayer().Name
      );
    }
    onMessageChange("");
  };

  // React.useEffect(() => {
  //   setChatMessages(
  //     props.connectionService.Chat.chatHistory().map((message, index) => {
  //       const date = new Date(message.timestamp);
  //       return (
  //         <span className={styles.message} key={index}>
  //           <b>{message.from}</b>
  //           {` [${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: ${
  //             message.message
  //           }`}
  //         </span>
  //       );
  //     })
  //   );

  //   props.connectionService.Chat.received((chatObject) => {
  //     setIncomingMessage(currentTab !== "lobby");

  //     const date = new Date(chatObject.timestamp);
  //     chatMessages.push(
  //       <span className={styles.message}>
  //         <b>{chatObject.from}</b>
  //         {` [${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: ${
  //           chatObject.message
  //         }`}
  //       </span>
  //     );
  //   });

  //   return () => {
  //     props.connectionService.Chat.disconnect();
  //   };
  // }, []);
  React.useEffect(() => {
    if (userMessageDialogElementRef.current) {
      userMessageDialogElementRef.current.scrollTop =
        userMessageDialogElementRef.current.scrollHeight;
    }
  }, [userMessageDialogElementRef.current]);
  function getQuickChatContents() {
    const contents: string[] = [];
    for (let i = 0; i <= quickMessageMaxIndex; i++) {
      contents.push(createRawQuickMessage(i));
    }

    return contents;
  }

  let onClickTab = (tab: "room" | "lobby") => {
    setIncomingMessage(false);
    setCurrentTab(tab);
  };

  let onClickQuickChatButton = () => {
    setHideQuickChatItems(!hideQuickChatItems);
  };

  let onClickQuickChatItem = (content: string) => () => {
    !props.replayMode &&
      props.store.room.broadcast(GameEventIdentifiers.UserMessageEvent, {
        message: content,
        playerId: props.presenter.getClientPlayer().Id,
      });
    setHideQuickChatItems(!hideQuickChatItems);
  };

  function getSkillAudios() {
    return props.presenter.getClientPlayer() !== undefined &&
      props.presenter.getClientPlayer().Character
      ? props.presenter
          .ClientPlayer!.Character.Skills.filter(
            (skill) => !skill.isShadowSkill()
          )
          .reduce<string[]>((audioNames, skill) => {
            const characterName =
              props.presenter.getClientPlayer().Character.Name;
            for (let i = 1; i <= skill.audioIndex(); i++) {
              audioNames.push(
                skill.RelatedCharacters.includes(characterName)
                  ? "$" + skill.Name + "." + characterName + ":" + i
                  : "$" + skill.Name + ":" + i
              );
            }

            return audioNames;
          }, [])
      : [];
  }

  return (
    <div className={styles.chat}>
      <Tab
        onClickTab={onClickTab}
        translator={props.translator}
        hasIncomingMessage={incomingMessage}
        defaultTab={currentTab}
      />
      <div
        className={styles.messageDialog}
        ref={userMessageDialogElementRef}
        style={{
          minHeight: textMessageMinHeight,
          height: userMessageDialogElementRef.current
            ? `${
                userMessageDialogElementRef.current.clientHeight +
                props.fixedHeight
              }px`
            : undefined,
        }}
      >
        {(currentTab === "room" ? props.store.messageLog : chatMessages).map(
          (log, index) => (
            <p className={styles.messageLine} key={index}>
              {log}
            </p>
          )
        )}
      </div>

      <form
        className={classNames(styles.inputLabel, props.className)}
        onSubmit={onClickSendButton}
      >
        {!hideQuickChatItems ? (
          <div className={styles.quickChat}>
            {[...getSkillAudios(), ...getQuickChatContents()].map(
              (content, index) => (
                <div>
                  <span
                    key={index}
                    className={styles.quickChatItems}
                    onClick={onClickQuickChatItem(content)}
                  >
                    {props.translator.tr(content)}
                  </span>
                  <br />
                </div>
              )
            )}
          </div>
        ) : (
          <></>
        )}
        <Input
          className={styles.chatInput}
          onChange={onMessageChange}
          placeholder={props.translator.tr("please enter your text here")}
          value={textMessage}
        />
        <Button
          className={styles.sendButton}
          variant="primary"
          type="button"
          onClick={onClickQuickChatButton}
        >
          💬
        </Button>
        <Button
          className={styles.sendButton}
          variant="primary"
          disabled={!textMessage}
        >
          {props.translator.tr("send")}
        </Button>
      </form>
    </div>
  );
}
