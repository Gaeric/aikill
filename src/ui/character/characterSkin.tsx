import classNames from "classnames";
import {
  Character,
  getNationalityRawText,
} from "src/core/characters/character";
import { Sanguosha } from "src/core/game/engine";
import { Skill } from "src/core/skills/skill";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import * as React from "react";
import { CharacterSkinInfo } from "src/skins/skins";
import { Armor } from "src/ui/armor/armor";
import { AudioService } from "src/ui/audio/install";
import styles from "./character.module.css";
import { NationalityBadge } from "../badge/badge";
import { CharacterHp } from "../hp/hp";

export type CharacterSkinCardProps = {
  character: Character;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  skinData?: CharacterSkinInfo[];
  skinName?: string;
  onClick?(skinName: string): void;
  disabled?: boolean;
  className?: string;
  size?: "regular" | "small";
  selected?: boolean;
};

export function CharacterSkinCard(props: CharacterSkinCardProps) {
  let skinNameList: string[] = [props.character.Name];
  let skinNameLists: string[] = [];
  const [characterImage, setCharacterImage] = React.useState<
    string | undefined
  >();
  const [characterSkinImageL, setCharacterSkinImageL] = React.useState<
    string | undefined
  >();
  const [characterSkinImageR, setCharacterSkinImageR] = React.useState<
    string | undefined
  >();
  const [skinName, setSkinName] = React.useState<string>();
  let posX: number;

  function onClick(
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>
  ) {
    let clientX =
      (e as React.MouseEvent<HTMLElement, MouseEvent>).clientX ||
      (e as React.TouchEvent<HTMLElement>).touches[0].clientX;
    posX = clientX;

    const characterImageElement = document.getElementsByClassName(
      classNames(styles.characterCard, props.className)
    )[0];
    const imagePosition = getOffset(characterImageElement);
    const position = {
      x: imagePosition.left,
      y: imagePosition.top,
    };
    if (
      posX < position.x + characterImageElement.clientWidth / 2 &&
      posX > position.x - 100
    ) {
      preSkin();
    }
    if (
      posX > position.x + characterImageElement.clientWidth / 2 &&
      posX < position.x + characterImageElement.clientWidth + 100
    ) {
      nextSkin();
    }
    props.onClick && skinName && props.onClick(skinName);
  }
  function getOffset(el: Element) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
    };
  }
  function getSkinNameList() {
    props.skinData
      ?.find((skinInfo) => skinInfo.character === props.character.Name)
      ?.infos.find((skinInfo) =>
        skinInfo.images?.forEach((imageInfo) =>
          skinNameList.push(imageInfo.name)
        )
      );

    return skinNameLists;
  }

  function nextSkin() {
    const next = skinNameLists.shift();
    if (next) {
      skinNameLists.push(next);
    }
    setSkinName(() => skinNameLists[0]);

    getSkinImage();
  }
  function preSkin() {
    const p = skinNameLists.pop();
    if (p) {
      skinNameLists.unshift(p);
    }
    setSkinName(() => skinNameLists[0]);

    getSkinImage();
  }

  async function getSkinImage() {
    let characterImageUrl = (
      await props.imageLoader.getCharacterSkinPlay(
        props.character.Name,
        props.skinData,
        undefined,
        skinNameLists[0]
      )
    ).src;
    setCharacterImage(() => characterImageUrl);

    if (skinNameLists.length > 2) {
      let characterImageL = (
        await props.imageLoader.getCharacterSkinPlay(
          props.character.Name,
          props.skinData,
          undefined,
          skinNameLists[skinNameLists.length - 1]
        )
      ).src;
      if (characterImageL) {
        setCharacterSkinImageL(() => characterImageL);
      }
    } else {
      setCharacterSkinImageL(() => "");
    }

    if (skinNameLists.length > 1) {
      let characterImageR = (
        await props.imageLoader.getCharacterSkinPlay(
          props.character.Name,
          props.skinData,
          undefined,
          skinNameLists[1]
        )
      ).src;
      if (characterImageR) {
        setCharacterSkinImageR(() => characterImageR);
      }
    } else {
      setCharacterSkinImageL(() => "");
    }
  }

  React.useEffect(() => {
    if (!skinNameLists.includes(props.character.Name)) {
      getSkinNameList();
    }
    getSkinImage();
  });
  const { character, translator, className, size, selected } = props;
  return (
    <div
      className={classNames(
        styles.characterCard,
        className,
        styles.characterSkinArea
      )}
      onClick={onClick}
    >
      <div
        className={classNames(styles.characterCard, className, {
          [styles.small]: size === "small",
          [styles.selected]: selected,
        })}
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
            <div className={classNames(styles.hpContainer)}>
              <Armor
                className={classNames(styles.characterArmor)}
                amount={character.Armor}
              />
              <CharacterHp
                character={character}
                className={classNames(styles.characterHp, {
                  [styles.small]: size === "small",
                })}
              />
            </div>

            <img
              className={classNames(
                styles.characterImage,
                { [styles.small]: size === "small" },
                styles.right
              )}
              src={characterSkinImageR}
              alt=""
            />
            <img
              className={classNames(
                styles.characterImage,
                { [styles.small]: size === "small" },
                styles.left
              )}
              src={characterSkinImageL}
              alt=""
            />

            <img
              className={classNames(styles.characterImage, {
                [styles.small]: size === "small",
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
    </div>
  );
}

export type CharacterSpecProps = {
  character: Character;
  audioService: AudioService;
  translator: ClientTranslationModule;
  skinName: string;
  skinData?: CharacterSkinInfo[];
};

export function CharacterSpec(props: CharacterSpecProps) {
  let currentAudioIndexMapper: { [skillName: string]: number } = {};
  const [skills, setSkills] = React.useState<Skill[]>([]);
  function getSkillName() {
    setSkills(props.character.Skills.filter((skill) => !skill.isShadowSkill()));
    return skills;
  }
  function onPlaySkillAudio(skillName: string, skinName: string) {
    let audioIndex: number | undefined;
    if (
      Sanguosha.getSkillBySkillName(skillName).audioIndex(
        props.character.Name
      ) > 0
    ) {
      currentAudioIndexMapper[skillName] =
        currentAudioIndexMapper[skillName] || 1;
      audioIndex = currentAudioIndexMapper[skillName];
      ++currentAudioIndexMapper[skillName] >
        Sanguosha.getSkillBySkillName(skillName).audioIndex(
          props.character.Name
        ) && (currentAudioIndexMapper[skillName] = 1);
    }

    if (props.skinName && props.skinName !== props.character.Name) {
      props.audioService.playSkillAudio(
        skillName,
        props.character.Gender,
        audioIndex,
        true,
        props.skinData,
        props.character.Name,
        props.skinName
      );
    } else {
      props.audioService.playSkillAudio(
        skillName,
        props.character.Gender,
        audioIndex,
        true,
        [],
        props.character.Name
      );
    }
  }
  function onPlayDeathAudio(characterName: string, skinName?: string) {
    if (props.skinName && props.skinName !== characterName) {
      props.audioService.playDeathAudio(
        characterName,
        true,
        props.skinData,
        props.skinName
      );
    } else {
      props.audioService.playDeathAudio(characterName, true, []);
    }
  }
  React.useEffect(() => {
    setSkills(() => []);
    getSkillName();
    currentAudioIndexMapper = {};
  }, []);

  const relatedSkills =
    skills.length > 0
      ? skills.reduce<Skill[]>((skills, skill) => {
          skill.RelatedSkills.length > 0 &&
            skills.push(
              ...skill.RelatedSkills.map((skillName) =>
                Sanguosha.getSkillBySkillName(skillName)
              )
            );
          return skills;
        }, [])
      : [];
  return (
    <div className={styles.characterSpec}>
      <span
        className={styles.deathButton}
        onClick={() => onPlayDeathAudio(props.character.Name)}
      >
        {props.translator.trx("death audio")}
      </span>
      {skills.length > 0 &&
        skills.map((skill) => (
          <div className={styles.skill} key={skill.Name}>
            <span
              className={styles.skillName}
              onClick={() => onPlaySkillAudio(skill.Name, props.skinName)}
            >
              {props.translator.tr(skill.Name)}
            </span>
            <span
              className={styles.skillDescription}
              dangerouslySetInnerHTML={{
                __html: props.translator.tr(skill.Description),
              }}
            />
          </div>
        ))}
      {relatedSkills.length > 0 && (
        <span className={styles.relatedSkillTiltle}>
          {props.translator.trx("related skill")}
        </span>
      )}
      {relatedSkills.length > 0 &&
        relatedSkills.map((skill) => (
          <div className={styles.skill} key={skill.Name}>
            <span
              className={classNames(styles.skillName, styles.relatedSkill)}
              onClick={() => onPlaySkillAudio(skill.Name, props.skinName)}
            >
              {props.translator.tr(skill.Name)}
            </span>
            <span
              className={styles.skillDescription}
              dangerouslySetInnerHTML={{
                __html: props.translator.tr(skill.Description),
              }}
            />
          </div>
        ))}
    </div>
  );
}
