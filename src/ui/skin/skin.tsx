import classNames from "classnames";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { CharacterSkinInfo } from "src/skins/skins";
import styles from "./skin.module.css";

export type SkinCardProps = {
  character: string;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  skinName: string;
  playerId: string;
  skinData?: CharacterSkinInfo[];
  onClick?(skinName: string): void;
  disabled?: boolean;
  className?: string;
  size?: "regular" | "small";
  selected?: boolean;
};

export function SkinCard(props: SkinCardProps) {
  const [skinImage, setSkinImage] = React.useState<string | undefined>();
  function onClick() {
    if (props.disabled) {
      props.onClick && props.onClick(props.skinName);
    }
  }

  React.useState(async () => {
    setSkinImage(
      (
        await props.imageLoader.getCharacterSkinPlay(
          props.character,
          props.skinData,
          props.playerId,
          props.skinName
        )
      ).src
    );
  });

  return (
    <div
      className={classNames(styles.characterCard, props.className, {
        [styles.small]: props.size === "small",
        [styles.selected]: props.selected,
      })}
      onClick={onClick}
    >
      {skinImage ? (
        <>
          <img
            className={classNames(styles.characterImage, {
              [styles.small]: props.size === "small",
            })}
            src={skinImage}
            alt=""
          />
        </>
      ) : (
        <p>{props.translator.tr(props.skinName)}</p>
      )}
    </div>
  );
}
