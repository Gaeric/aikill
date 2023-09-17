import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { RoomPresenter } from "src/pages/room/room.presenter";
import { RoomStore } from "src/pages/room/room.store";
import * as React from "react";
import { ConnectionService } from "src/services/connection_service/connection_service";
import styles from "./game_dialog.module.css";
import { MessageDialog } from "../message_dialog/message_dialog";

export type GameDialogProps = {
  translator: ClientTranslationModule;
  store: RoomStore;
  presenter: RoomPresenter;
  connectionService: ConnectionService;
  replayOrObserverMode?: boolean;
};

export function GameDialog(props: GameDialogProps) {
  let dialogElementRef = React.useRef<HTMLDivElement>();
  let borderElementRef = React.useRef<HTMLDivElement>();
  let dialogHeight: React.CSSProperties;

  let mouseDown = false;
  let fixedHeight = 0;
  let textMessageStartTopPosition: number | undefined;
  React.useEffect(() => {
    window.addEventListener("mousedown", (e) => {
      if (e.currentTarget === borderElementRef.current) {
        mouseDown = true;
      }
    });
    window.addEventListener("mouseup", (e) => {
      mouseDown = false;
      window.removeEventListener("mousemove", onBorderMove);
    });
  }, []);
  React.useEffect(() => {
    if (dialogElementRef.current) {
      dialogElementRef.current.scrollTop =
        dialogElementRef.current.scrollHeight;
    }
  });

  let onBorderDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    textMessageStartTopPosition = event.clientY;
    window.addEventListener("mousemove", onBorderMove);
  };

  let onBorderMove = (e: MouseEvent) => {
    if (textMessageStartTopPosition === undefined) {
      return;
    }
    if (fixedHeight === textMessageStartTopPosition - e.clientY) {
      return;
    }

    fixedHeight = textMessageStartTopPosition - e.clientY;
    textMessageStartTopPosition = e.clientY;
    const height = dialogElementRef.current!.clientHeight - fixedHeight;
    dialogHeight = {
      height,
    };
  };

  let onBorderLeave = () => {
    textMessageStartTopPosition = undefined;
    if (!mouseDown) {
      window.removeEventListener("mousemove", onBorderMove);
    }
  };

  return (
    <div className={styles.gameDialog}>
      <div className={styles.dialogs}>
        <div
          className={styles.gameLogDialog}
          ref={dialogElementRef}
          style={dialogHeight}
        >
          {props.store.gameLog.map((log, index) =>
            typeof log === "string" ? (
              <p
                className={styles.messageLine}
                key={index}
                dangerouslySetInnerHTML={{ __html: log }}
              />
            ) : (
              <p className={styles.messageLine} key={index}>
                {log}
              </p>
            )
          )}
        </div>
        <div
          ref={borderElementRef}
          className={styles.dragBorder}
          onMouseDown={onBorderDown}
          onMouseUp={onBorderLeave}
        />
        <MessageDialog
          translator={props.translator}
          store={props.store}
          presenter={props.presenter}
          replayMode={props.replayOrObserverMode}
          fixedHeight={fixedHeight}
          connectionService={props.connectionService}
        />
      </div>
    </div>
  );
}
