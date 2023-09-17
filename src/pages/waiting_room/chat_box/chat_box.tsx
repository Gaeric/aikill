import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import * as React from "react";
import { Button } from "src/ui/button/button";
import styles from "./chat_box.module.css";
import { Messages } from "./messages";
import { WaitingRoomSender } from "../services/sender_service";
import {
  WaitingRoomPresenter,
  WaitingRoomStoreType,
} from "../waiting_room.presenter";

export type ChatBoxProps = {
  translator: ClientTranslationModule;
  presenter: typeof WaitingRoomPresenter;
  store: WaitingRoomStoreType;
  senderService: WaitingRoomSender;
  playerName: string;
};

export function ChatBox(props: ChatBoxProps) {
  const [typing, setTyping] = React.useState<string>("");

  let onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTyping(e.currentTarget.value);
  };

  let onSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.senderService.sendChat(props.playerName, typing);

    setTyping("");
  };

  function getMessages() {
    return props.store.chatMessages.map((message, index) => {
      const date = new Date(message.timestamp);
      return (
        <span className={styles.message} key={index}>
          <b>{message.from}</b>
          {`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: ${
            message.message
          }`}
        </span>
      );
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.messageBox}>{getMessages()}</div>
      <form className={styles.userInput} onSubmit={onSend}>
        <input
          className={styles.input}
          value={typing}
          onChange={onInputChange}
        />
        <Button className={styles.sendButton} variant="primary" type="submit">
          {props.translator.tr(Messages.send())}
        </Button>
      </form>
    </div>
  );
}
