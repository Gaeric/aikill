import classNames from "classnames";
import {
  Character,
  getNationalityRawText,
} from "src/core/characters/character";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { Armor } from "src/ui/armor/armor";
import styles from "./character.module.css";
import { NationalityBadge } from "../badge/badge";
import { CharacterHp } from "../hp/hp";

export type CharacterCardProps = {
  character: Character;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  onClick?(character: Character): void;
  disabled?: boolean;
  className?: string;
  size?: "regular" | "small" | "tiny";
  selected?: boolean;
};

export function CharacterCard(props: CharacterCardProps) {
  const [characterImage, setCharacterImage] = React.useState<
    string | undefined
  >(props.imageLoader.getCharacterImage(props.character.Name).src);
  function onClick() {
    if (!props.disabled) {
      props.onClick && props.onClick(props.character);
      // forceUpdate();
    }
  }
  async function getImage() {
    if (!characterImage) {
      let url = (
        await props.imageLoader.getCharacterImage(props.character.Name)
      ).src;
      if (url) {
        setCharacterImage(() => url);
      }
    }
  }

  React.useEffect(() => {
    getImage();
  });

  const { character, translator, className, size, selected } = props;
  return (
    <div
      className={classNames(styles.characterCard, className, {
        [styles.small]: size === "small",
        [styles.tiny]: size === "tiny",
        [styles.selected]: selected,
        [styles.clickable]: !!onClick,
      })}
      onClick={onClick}
    >
      {characterImage ? (
        <>
          <NationalityBadge
            size={size}
            nationality={character.Nationality}
            isLord={character.isLord()}
          >
            {translator.tr(character.Name)}
          </NationalityBadge>
          <div className={styles.hpContainer}>
            <Armor
              className={styles.characterArmor}
              imgClassName={styles.characterArmorImage}
              amount={character.Armor}
            />
            <CharacterHp
              character={character}
              className={classNames(styles.characterHp, {
                [styles.small]: size === "small",
                [styles.tiny]: size === "tiny",
              })}
            />
          </div>
          <img
            className={classNames(styles.characterImage, {
              [styles.small]: size === "small",
              [styles.tiny]: size === "tiny",
            })}
            src={characterImage}
            alt=""
          />
        </>
      ) : (
        <p>
          {translator.tr(getNationalityRawText(character.Nationality))}{" "}
          {translator.tr(character.Name)}
        </p>
      )}
    </div>
  );
}
