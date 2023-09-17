import classNames from "classnames";
import { Sanguosha } from "src/core/game/engine";
import { TemporaryRoomCreationInfo } from "src/core/game/game_props";
import { GameMode } from "src/core/shares/types/room_props";
import { TranslationPack } from "src/core/translations/translation_json_tool";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronData } from "src/electron_loader/electron_data";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { Button } from "src/ui/button/button";
import { CheckBox } from "src/ui/check_box/check_box";
import { CheckBoxGroup } from "src/ui/check_box/check_box_group";
import { Dialog } from "src/ui/dialog/dialog";
import { Picture } from "src/ui/picture/picture";
import styles from "./create_room_dialog.module.css";
import { Messages } from "./messages";

type CreateRoomDialogProps = {
  playerName: string;
  translator: ClientTranslationModule;
  onSubmit(
    data: TemporaryRoomCreationInfo,
    roomName: string,
    passcode?: string
  ): void;
  onCancel(): void;
  imageLoader: ImageLoader;
  electronLoader: ElectronLoader;
};

export function CreateRoomDialog(props: CreateRoomDialogProps) {
  let username: string = props.electronLoader.getData(ElectronData.PlayerName);

  const [numberOfPlayers, setNumberOfPlayersChange] = React.useState(2);
  const [passcode, setPasscode] = React.useState("");
  const [roomName, setRoomName] = React.useState(
    username
      ? props.translator.tr(
          TranslationPack.translationJsonPatcher(
            "{0}'s room",
            username
          ).extract()
        )
      : ""
  );
  const [allowAllCharacters, setAllowAllCharacters] = React.useState(
    props.electronLoader.getData(
      ElectronData.RoomSettingsCampaignModeAllowAllCharacters
    ) || false
  );

  let gameModeOptions = [
    {
      label: props.translator.tr(Messages.multi()),
      id: GameMode.Standard,
      checked: false,
    },
    {
      label: props.translator.tr(Messages.campaign()),
      id: GameMode.Pve,
      checked: true,
    },
  ];

  function getGameMode(gameMode: GameMode, defaultMode?: GameMode) {
    if (gameMode === GameMode.Pve) {
      return numberOfPlayers === 4 ? GameMode.PveClassic : GameMode.Pve;
    }

    return defaultMode || gameMode;
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const gameMode = gameModeOptions.find((o) => o.checked)?.id!;
    props.onSubmit(
      {
        hostPlayerId: props.electronLoader.getTemporaryData(
          ElectronData.PlayerId
        )!,
        numberOfPlayers: gameMode === GameMode.Pve ? numberOfPlayers : 8,
        roomName: roomName,
        gameMode: getGameMode(
          gameMode,
          props.electronLoader.getData(ElectronData.RoomSettingsGameMode)
        ),
        passcode: passcode,
        characterExtensions:
          props.electronLoader.getData(
            ElectronData.RoomSettingsCharacterExtensions
          ) || Sanguosha.getGameCharacterExtensions(),
        campaignMode: gameMode === GameMode.Pve,
        coreVersion: Sanguosha.Version,
        cardExtensions:
          props.electronLoader.getData(
            ElectronData.RoomSettingsCardExtensions
          ) || Sanguosha.getCardExtensionsFromGameMode(gameMode),
        allowObserver:
          props.electronLoader.getData(
            ElectronData.RoomSettingsAllowObserver
          ) || false,
        playingTimeLimit:
          props.electronLoader.getData(ElectronData.RoomSettingsPlayTime) || 60,
        wuxiekejiTimeLimit:
          props.electronLoader.getData(
            ElectronData.RoomSettingsWuxiekejiTime
          ) || 15,
        fortuneCardsExchangeLimit:
          props.electronLoader.getData(
            ElectronData.RoomSettingsFortuneCardsExchangeTime
          ) || 0,
        excludedCharacters:
          props.electronLoader.getData(
            ElectronData.RoomSettingsDisabledCharacters
          ) || [],
        allowAllCharacters: allowAllCharacters,
      },
      roomName,
      passcode
    );
  }

  let onRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };
  let onPasscodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(event.target.value);
  };

  let onNumberOfPlayersChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setNumberOfPlayersChange(parseInt(event.target.value, 10));
  };

  let onCheckingAllCharacter = (checked: boolean) => {
    setAllowAllCharacters(checked);
    props.electronLoader.setData(
      ElectronData.RoomSettingsCampaignModeAllowAllCharacters,
      checked
    );
  };

  let onGameModeChecked = (gameModes: GameMode[]) => {
    for (const option of gameModeOptions) {
      if (gameModes.find((mode) => mode === option.id)) {
        option.checked = true;
      } else {
        option.checked = false;
      }
    }
  };

  let selectPlayerOptions = [
    { content: "one player", value: 2 },
    { content: "pve classic one players", value: 4 },
  ];

  let onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
  };

  return (
    <Dialog className={styles.createRoomDialog} onClose={props.onCancel}>
      <Picture
        image={props.imageLoader.getDialogBackgroundImage()}
        className={styles.background}
      />
      <form
        onSubmit={onSubmit}
        className={styles.createRoomForm}
        onMouseDown={onAction}
      >
        <div className={styles.layout}>
          <div className={classNames(styles.verticalLayout, styles.basicInfo)}>
            <div className={styles.inputField}>
              <span className={styles.inputLabelText}>
                {props.translator.tr(Messages.enterRoomName())}
              </span>
              <input
                className={styles.input}
                value={roomName}
                onChange={onRoomNameChange}
              />
            </div>
            <div className={styles.inputField}>
              <span className={styles.inputLabelText}>
                {props.translator.tr(Messages.enterRoomPassword())}
              </span>
              <input
                className={styles.input}
                value={passcode}
                onChange={onPasscodeChange}
              />
            </div>
            <div className={styles.inputField}>
              <span className={styles.inputLabelText}>
                {props.translator.tr(Messages.enterPlayersNumber())}
              </span>
              <select
                className={styles.input}
                value={numberOfPlayers}
                onChange={onNumberOfPlayersChange}
                disabled={
                  gameModeOptions.find((o) => o.checked)?.id !== GameMode.Pve
                }
              >
                {selectPlayerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {props.translator.tr(option.content)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.verticalLayout}>
            <div className={styles.inputField}>
              <CheckBoxGroup
                head={props.translator.tr(Messages.selectGameMode())}
                options={gameModeOptions}
                onChecked={onGameModeChecked}
                excludeSelection={true}
              />
            </div>
            <div className={styles.inputField}>
              <CheckBox
                label={props.translator.tr(Messages.allowAllCharacters())}
                id="allAllCharacters"
                onChecked={onCheckingAllCharacter}
                checked={allowAllCharacters}
                disabled={
                  gameModeOptions.find((o) => o.checked)?.id !== GameMode.Pve
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.submitSection}>
          <Button variant="primary" type="submit">
            {props.translator.tr(Messages.confirm())}
          </Button>
          <Button variant="primary" type="button" onClick={props.onCancel}>
            {props.translator.tr(Messages.cancel())}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
