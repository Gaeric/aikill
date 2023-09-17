import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { CharacterSkinInfo } from "src/skins/skins";
import { SkinCard } from "src/ui/skin/skin";
import styles from "./skin_selector_dialog.module.css";
import { getSkinName } from "../../switch_avatar/switch_skin";
import { BaseDialog } from "../base_dialog";

type SkinSelectorDialogProps = {
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  character: string;
  playerId: string;
  skinData?: CharacterSkinInfo[];
  onClick?(skinName: string): void;
};

export function SkinSelectorDialog(props: SkinSelectorDialogProps) {
  const [selectedSkins, setSelectedSkins] = React.useState<string[]>([]);

  function onClick(skinName: string) {
    props.onClick && props.onClick(skinName);
  }

  const skinNameList = getSkinName(
    props.character,
    props.playerId,
    props.skinData
  ).skinNameList.concat();
  if (!skinNameList.includes("random")) {
    skinNameList.push("random");
  }
  return (
    <BaseDialog title={props.translator.tr("please choose a skin")}>
      <div className={styles.innerDialog}>
        <div className={styles.characterSelector}>
          {skinNameList.map((skinName, index) => (
            <div className={styles.characterSelectorItem} key={index}>
              <SkinCard
                imageLoader={props.imageLoader}
                skinData={props.skinData}
                translator={props.translator}
                character={props.character}
                skinName={skinName}
                playerId={props.playerId}
                key={skinName}
                onClick={onClick}
                size={"small"}
                selected={selectedSkins.includes(skinName)}
              />
            </div>
          ))}
        </div>
      </div>
    </BaseDialog>
  );
}
