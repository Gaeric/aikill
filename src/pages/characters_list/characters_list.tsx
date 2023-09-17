import { AudioLoader } from "audio_loader/audio_loader";
import { CharacterNationality } from "src/core/characters/character";
import { CharacterId } from "src/core/characters/character";
import { Sanguosha } from "src/core/game/engine";
import { GameCharacterExtensions } from "src/core/game/game_props";
import { CharacterLoader } from "src/core/game/package_loader/loader.characters";
import { Functional } from "src/core/shares/libs/functional";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ElectronLoader } from "src/electron_loader/electron_loader";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { CharacterSkinInfo } from "src/skins/skins";
import { PagePropsWithConfig } from "src/types/page_props";
import { installAudioPlayerService } from "src/ui/audio/install";
import { Button } from "src/ui/button/button";
import { CharacterCard } from "src/ui/character/character";
import {
  CharacterSkinCard,
  CharacterSpec,
} from "src/ui/character/characterSkin";
import { CheckBoxGroup } from "src/ui/check_box/check_box_group";
import { Picture } from "src/ui/picture/picture";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./characters_list.module.css";
import { useNavigate } from "react-router-dom";

export type CharactersListProps = PagePropsWithConfig<{
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  audioLoader: AudioLoader;
  electronLoader: ElectronLoader;
  skinData?: CharacterSkinInfo[];
}>;

export function CharactersList(props: CharactersListProps) {
  let backgroundImage = props.imageLoader.getLobbyBackgroundImage();
  let roomListBackgroundImage = props.imageLoader.getRoomListBackgroundImage();
  let audioService = installAudioPlayerService(
    props.audioLoader,
    props.electronLoader
  );

  const [focusedCharacterId, setFocusedCharacterId] =
    React.useState<CharacterId>();
  const [focusedSkinName, setFocusedSkinName] = React.useState<string>();
  const [characterExtensionOptions, setCharacterExtensionOptions] =
    React.useState(
      Sanguosha.getGameCharacterExtensions().map((ext) => ({
        label: props.translator.tr(ext),
        checked: true,
        id: ext,
      }))
    );

  let nationalityOptions = Sanguosha.getNationalitiesList().map(
    (nationality) => ({
      label: props.translator.tr(
        Functional.getPlayerNationalityText(nationality)
      ),
      checked: true,
      id: nationality,
    })
  );

  const navigate = useNavigate();
  let backToLobby = () => {
    navigate("/lobby");
    // props.history.push("/lobby");
  };
  const [checkedExtensions, setCheckedExtensions] = React.useState<
    GameCharacterExtensions[]
  >(Sanguosha.getGameCharacterExtensions());

  const [selectedNationalities, setSelectedNationalities] = React.useState<
    CharacterNationality[]
  >(Sanguosha.getNationalitiesList());

  let onCheckExtension = (exts: GameCharacterExtensions[]) => {
    setCheckedExtensions(() => exts);

    setCharacterExtensionOptions(() => {
      for (const option of characterExtensionOptions) {
        if (exts.find((ext) => ext === option.id)) {
          option.checked = true;
        } else {
          option.checked = false;
        }
      }
      return characterExtensionOptions;
    });
  };

  let onCheckNationality = (nationalities: CharacterNationality[]) => {
    setSelectedNationalities(() => nationalities);
    for (const option of nationalityOptions) {
      if (
        nationalities.find((nationality) => nationality === option.id) != null
      ) {
        option.checked = true;
      } else {
        option.checked = false;
      }
    }
  };

  function Characters() {
    return CharacterLoader.getInstance()
      .getPackages(...checkedExtensions)
      .filter((character) =>
        selectedNationalities.includes(character.Nationality)
      );
  }

  let onHoverCharacter = (characterId: CharacterId) => () => {
    setFocusedCharacterId(() => characterId);
    setFocusedSkinName(Sanguosha.getCharacterById(characterId).Name);
  };

  let onfocusedSkinName = (skinName: string) => {
    setFocusedSkinName(() => skinName);
  };

  return (
    <div className={styles.charactersList}>
      <Picture image={backgroundImage} className={styles.background} />
      <div className={styles.board}>
        <div className={styles.functionBoard}>
          <Button
            variant="primary"
            className={styles.button}
            onClick={backToLobby}
          >
            {props.translator.tr("back to lobby")}
          </Button>
        </div>
        <div className={styles.innerList}>
          <Picture
            image={roomListBackgroundImage}
            className={styles.roomListBackground}
          />
          <div className={styles.checkboxGroups}>
            <CheckBoxGroup
              className={styles.packagesGroup}
              options={characterExtensionOptions}
              onChecked={onCheckExtension}
              itemsPerLine={6}
            />
            <CheckBoxGroup
              className={styles.nationalitiesGroup}
              options={nationalityOptions}
              onChecked={onCheckNationality}
              itemsPerLine={6}
            />
          </div>
          <div className={styles.characters}>
            {Characters().map((character) => (
              <CharacterCard
                key={character.Id}
                character={character}
                imageLoader={props.imageLoader}
                translator={props.translator}
                className={styles.character}
                onClick={onHoverCharacter(character.Id)}
                size="small"
              />
            ))}
          </div>
          {focusedCharacterId !== undefined && (
            <Tooltip
              position={["slightTop"]}
              className={styles.characterTooltip}
            >
              <CharacterSkinCard
                className={styles.specCharacter}
                character={Sanguosha.getCharacterById(focusedCharacterId)}
                onClick={onfocusedSkinName}
                skinData={props.skinData}
                imageLoader={props.imageLoader}
                translator={props.translator}
              />
              <CharacterSpec
                character={Sanguosha.getCharacterById(focusedCharacterId)}
                audioService={audioService}
                skinData={props.skinData}
                skinName={
                  focusedSkinName
                    ? focusedSkinName
                    : Sanguosha.getCharacterById(focusedCharacterId).Name
                }
                translator={props.translator}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
