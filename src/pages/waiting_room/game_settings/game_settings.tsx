import classNames from "classnames";
import { Character } from "src/core/characters/character";
import { Sanguosha } from "src/core/game/engine";
import {
  GameCharacterExtensions,
  WaitingRoomGameSettings,
} from "src/core/game/game_props";
import { GameMode } from "src/core/shares/types/room_props";
import { WuXieKeJiSkill } from "src/core/skills";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { CharacterCard } from "src/ui/character/character";
import { CheckBox } from "src/ui/check_box/check_box";
import { CheckBoxGroup } from "src/ui/check_box/check_box_group";
import { Input } from "src/ui/input/input";
import { Spacing } from "src/ui/layout/spacing";
import { Text } from "src/ui/text/text";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./game_settings.module.css";
import { createTranslationMessages } from "./messages";
import {
  WaitingRoomPresenter,
  WaitingRoomStoreType,
} from "../waiting_room.presenter";

export type GameSettingsProps = {
  controlable: boolean;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  presenter: typeof WaitingRoomPresenter;
  store: WaitingRoomStoreType;
  className?: string;
  campaignSettings?: boolean;
  onSave(): void;
};

export function GameSettings(props: GameSettingsProps) {
  let translationMessage = createTranslationMessages(props.translator);
  let inputDebounceTimer: NodeJS.Timer | undefined;
  let passwordInputDebounceTimer: NodeJS.Timer | undefined;
  let searchContentElementRef = React.useRef<HTMLDivElement>();

  const [searchCharacterInput, setSearchCharacterInput] =
    React.useState<string>("");

  const [searchTooltipPosition, setSearchTooltipPosition] = React.useState<
    [number, number] | undefined
  >();

  const [searchResultList, setSearchResultList] = React.useState<Character[]>(
    []
  );

  //  原get
  function pvePlayersOptions() {
    return [
      {
        label: translationMessage.pveDragon(),
        id: 3,
        checked: props.store.gameSettings.pveNumberOfPlayers === 3,
        disabled: !props.controlable,
      },
      {
        label: translationMessage.pveClassic(),
        id: 5,
        checked: props.store.gameSettings.pveNumberOfPlayers === 5,
        disabled: !props.controlable,
      },
    ];
  }

  // 原get
  function getGameModeOptions() {
    return [
      {
        label: props.translator.tr(GameMode.Standard),
        id: GameMode.Standard,
        checked: props.store.gameSettings.gameMode === GameMode.Standard,
        disabled: !props.controlable,
      },
      {
        label: props.translator.tr(GameMode.OneVersusTwo),
        id: GameMode.OneVersusTwo,
        checked: props.store.gameSettings.gameMode === GameMode.OneVersusTwo,
        disabled: !props.controlable,
      },
      {
        label: props.translator.tr(GameMode.TwoVersusTwo),
        id: GameMode.TwoVersusTwo,
        checked: props.store.gameSettings.gameMode === GameMode.TwoVersusTwo,
        disabled: !props.controlable,
      },
      {
        label: props.translator.tr(GameMode.Pve),
        id: GameMode.Pve,
        checked: props.store.gameSettings.gameMode === GameMode.Pve,
        disabled: !props.controlable,
      },
      {
        label: props.translator.tr(GameMode.Hegemony),
        id: GameMode.Hegemony,
        checked: props.store.gameSettings.gameMode === GameMode.Hegemony,
        disabled: true,
      },
    ];
  }

  // 原get
  function gameCharacterExtensions() {
    return Sanguosha.getGameCharacterExtensions().map((extension) => ({
      id: extension,
      label: props.translator.tr(extension),
      checked: props.store.gameSettings.characterExtensions.includes(extension),
      disabled:
        extension === GameCharacterExtensions.Standard || !props.controlable,
    }));
  }

  function onChangeGameSettings<T>(property: keyof WaitingRoomGameSettings) {
    return (value: T) => {
      props.presenter.updateGameSettings({
        ...props.store.gameSettings,
        [property]: value,
      });
      props.onSave();
    };
  }

  let onChangePassword = (password: string) => {
    props.presenter.updateGameSettings({
      ...props.store.gameSettings,
      passcode: password || "",
    });

    passwordInputDebounceTimer = setTimeout(() => {
      props.onSave();

      passwordInputDebounceTimer = undefined;
    }, 1000);
  };

  let onCheckedGameMode = (checkedIds: GameMode[]) => {
    props.presenter.updateGameSettings({
      ...props.store.gameSettings,
      gameMode: checkedIds[0],
    });
    props.onSave();
  };

  let onCheckedPveSpecifiedGameMode = (playerNumbers: number[]) => {
    props.presenter.updateGameSettings({
      ...props.store.gameSettings,
      pveNumberOfPlayers: playerNumbers[0],
    });
    props.onSave();
  };

  let onSearchCharacterInputChange = (value?: string) => {
    setSearchCharacterInput(value ?? "");
    if (inputDebounceTimer) {
      clearTimeout(inputDebounceTimer);
    }

    inputDebounceTimer = setTimeout(() => {
      if (!searchCharacterInput) {
        setSearchResultList([]);
        inputDebounceTimer = undefined;
        return;
      }
      setSearchResultList(
        Sanguosha.getCharacterByExtensions(
          props.store.gameSettings.characterExtensions
        ).filter(
          (character) =>
            character.Name.includes(searchCharacterInput) ||
            props.translator.tr(character.Name).includes(searchCharacterInput)
        )
      );

      if (searchContentElementRef.current) {
        const { left } =
          searchContentElementRef.current.getBoundingClientRect();

        setSearchTooltipPosition([
          window.screen.width - left,
          window.screen.height / 2,
        ]);
      }

      inputDebounceTimer = undefined;
    }, 1000);
  };

  let addOrRemoveForbiddenCharactersById = (character: Character) => {
    if (!props.controlable) {
      return;
    }

    props.presenter.updateGameSettings(props.store, {
      ...props.store.gameSettings,
      excludedCharacters: props.store.gameSettings.excludedCharacters.includes(
        character.Id
      )
        ? props.store.gameSettings.excludedCharacters.filter(
            (characterId) => characterId !== character.Id
          )
        : [...props.store.gameSettings.excludedCharacters, character.Id],
    });
    props.onSave();

    setSearchCharacterInput("");
    setSearchResultList([]);
  };

  return (
    <div className={classNames(styles.container, props.className)}>
      {!props.campaignSettings && (
        <>
          <div className={styles.settingsLabel}>
            <CheckBoxGroup
              head={translationMessage.gameMode()}
              options={getGameModeOptions}
              onChecked={onCheckedGameMode}
              excludeSelection={true}
            />
          </div>
          {props.store.gameSettings.gameMode === GameMode.Pve && (
            <div className={styles.settingsLabel}>
              <CheckBoxGroup
                head={translationMessage.pveModeSelection()}
                options={pvePlayersOptions}
                onChecked={onCheckedPveSpecifiedGameMode}
                excludeSelection={true}
              />
            </div>
          )}
        </>
      )}
      <div className={styles.settingsLabel}>
        <CheckBoxGroup
          head={translationMessage.characterPackageSettings()}
          options={gameCharacterExtensions}
          onChecked={onChangeGameSettings("characterExtensions")}
          excludeSelection={false}
        />
      </div>
      <div className={styles.settingsLabel}>
        <CheckBox
          id="enableObserver"
          className={styles.observerCheckbox}
          checked={props.store.gameSettings.allowObserver || false}
          disabled={!props.controlable}
          onChecked={onChangeGameSettings("allowObserver")}
          label={translationMessage.enableObserver()}
        />
        <div className={styles.inputLabel}>
          <Text
            className={styles.inputTitle}
            color="white"
            variant="semiBold"
            bottomSpacing={Spacing.Spacing_8}
          >
            {translationMessage.passcode()}
          </Text>
          <Input
            value={props.store.gameSettings.passcode}
            onChange={onChangePassword}
            disabled={!props.controlable}
            transparency={0.3}
            min={5}
            max={60}
          />
        </div>
        <div className={classNames(styles.inputLabel, styles.horizontalInput)}>
          <div>
            <Text
              className={styles.inputTitle}
              color="white"
              variant="semiBold"
              bottomSpacing={Spacing.Spacing_8}
            >
              {translationMessage.getTimeLimit("play stage")}
            </Text>
            <Input
              type="number"
              value={props.store.gameSettings.playingTimeLimit?.toString()}
              onChange={onChangeGameSettings("playingTimeLimit")}
              disabled={!props.controlable}
              transparency={0.3}
              min={15}
              max={300}
              suffix={translationMessage.second()}
            />
          </div>
          <div>
            <Text
              className={styles.inputTitle}
              color="white"
              variant="semiBold"
              bottomSpacing={Spacing.Spacing_8}
            >
              {translationMessage.getTimeLimit(WuXieKeJiSkill.Name)}
            </Text>
            <Input
              type="number"
              value={props.store.gameSettings.wuxiekejiTimeLimit?.toString()}
              onChange={onChangeGameSettings("wuxiekejiTimeLimit")}
              disabled={!props.controlable}
              transparency={0.3}
              min={5}
              max={60}
              suffix={translationMessage.second()}
            />
          </div>
        </div>
        <div>
          <Text
            className={styles.inputTitle}
            color="white"
            variant="semiBold"
            bottomSpacing={Spacing.Spacing_8}
          >
            {translationMessage.fortuneCardExchangeLimit()}
          </Text>
          <Input
            type="number"
            value={props.store.gameSettings.fortuneCardsExchangeLimit?.toString()}
            onChange={onChangeGameSettings("fortuneCardsExchangeLimit")}
            disabled={!props.controlable}
            transparency={0.3}
            min={0}
            max={3}
            suffix={translationMessage.times()}
          />
        </div>
      </div>
      <div className={styles.settingsLabel} ref={searchContentElementRef}>
        <Text
          className={styles.inputTitle}
          color="white"
          variant="semiBold"
          bottomSpacing={Spacing.Spacing_16}
          topSpacing={Spacing.Spacing_16}
        >
          {translationMessage.forbiddenCharacters()}
        </Text>
        <Input
          value={searchCharacterInput}
          onChange={onSearchCharacterInputChange}
          disabled={!props.controlable}
          transparency={0.3}
          placeholder={translationMessage.searchCharacterByName()}
        />

        {searchResultList.length > 0 && searchTooltipPosition && (
          <Tooltip
            position={{
              bottom: searchTooltipPosition[1],
              right: searchTooltipPosition[0],
            }}
            className={styles.searchResultsList}
          >
            {searchResultList.map((character) => (
              <CharacterCard
                key={character.Id}
                character={character}
                size="tiny"
                imageLoader={props.imageLoader}
                translator={props.translator}
                onClick={addOrRemoveForbiddenCharactersById}
              />
            ))}
          </Tooltip>
        )}

        <div className={styles.searchResultsList}>
          {props.store.gameSettings.excludedCharacters.map((characterId) => (
            <CharacterCard
              key={characterId}
              character={Sanguosha.getCharacterById(characterId)}
              size="tiny"
              imageLoader={props.imageLoader}
              translator={props.translator}
              onClick={addOrRemoveForbiddenCharactersById}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
