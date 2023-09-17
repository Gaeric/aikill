import classNames from "classnames";
import { Card } from "src/core/cards/card";
import { CardId } from "src/core/cards/libs/card_props";
import { Character, CharacterId } from "src/core/characters/character";
import { Sanguosha } from "src/core/game/engine";
import { Player } from "src/core/player/player";
import { PlayerId, PlayerRole } from "src/core/player/player_props";
import { System } from "src/core/shares/libs/system";
import { MarkEnum } from "src/core/shares/types/mark_list";
import { Skill, TriggerSkill } from "src/core/skills/skill";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import { RoomPresenter } from "src/pages/room/room.presenter";
import { RoomStore } from "src/pages/room/room.store";
import { ImageProps } from "src/props/image_props";
import * as React from "react";
import { CharacterSkinInfo } from "src/skins/skins";
import { Armor } from "src/ui/armor/armor";
import { NationalityBadge } from "src/ui/badge/badge";
import { SkillButton } from "src/ui/button/skill_button";
import { Hp } from "src/ui/hp/hp";
import { Picture } from "src/ui/picture/picture";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./player_avatar.module.css";
import { getSkinName } from "../../ui/switch_avatar/switch_skin";
import { CardSelectorDialog } from "../dialog/card_selector_dialog/card_selector_dialog";
import { SkinSelectorDialog } from "../dialog/skin_selector_dialog/skin_selector_dialog";
import {
  AwakenSkillMark,
  LimitSkillMark,
  Mark,
  SwitchSkillMark,
} from "../mark/mark";
import { Mask } from "../mask/mask";
import { SwitchAvatar } from "../switch_avatar/switch_avatar";

type PlayerAvatarProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  skinData?: CharacterSkinInfo[];
  incomingMessage?: string;
  onCloseIncomingMessage?(): void;
  disabled?: boolean;
  selected?: boolean;
  delight?: boolean;
  skinName?: string;
  onClick?(player: Player, selected: boolean): void;
  onClickSkill?(skill: Skill, selected: boolean): void;
  isSkillDisabled(skill: Skill): boolean;
};

export function PlayerAvatar(props: PlayerAvatarProps) {
  const [skillSelected, setSkillSelected] = React.useState(false);

  const [onTooltipOpened, setOnTooltipOpened] = React.useState(false);
  const onTooltipOpeningTimer = React.useRef<null | ReturnType<
    typeof setTimeout
  >>();

  const [PlayerRoleCard, setPlayerRoleCard] =
    React.useState<() => JSX.Element>();
  const [PlayerImage, setPlayerImage] = React.useState<() => JSX.Element>();
  let skinName: string;

  const [mainImage, setMainImage] = React.useState<ImageProps | undefined>();
  const [newMainImage, setNewMainImage] = React.useState<
    ImageProps | undefined
  >();
  const [sideImage, setSideImage] = React.useState<ImageProps | undefined>();

  const [autoHidePlayerName, setAutoHidePlayerName] = React.useState(true);

  const [hideRelatedSkills, setHideRelatedSkills] = React.useState(true);
  let inProcessDialog = false;

  let openedDialog: string | undefined;

  let showPlayerName = () => {
    setAutoHidePlayerName(() => false);
  };

  let hidePlayerName = () => {
    setAutoHidePlayerName(() => true);
  };

  let onClick = () => {
    if (props.disabled === false) {
      props.onClick &&
        props.onClick(props.presenter.getClientPlayer(), !props.selected);
    }
  };

  let onClickSkill = (skill: Skill) => () => {
    console.log("点击技能");
    if (
      props.store.selectedSkill !== undefined &&
      skill !== props.store.selectedSkill
    ) {
      return;
    }

    if (skill instanceof TriggerSkill) {
      return;
    }
    let currentskillSelected = !skillSelected;
    setSkillSelected(() => currentskillSelected);
    props.onClickSkill && props.onClickSkill(skill, currentskillSelected);
  };

  React.useEffect(() => {
    if (props.store.selectedSkill === undefined) {
      setSkillSelected(() => false);
    }
  }, []);

  function getSkillButtons() {
    const { presenter, translator, isSkillDisabled, imageLoader } = props;
    const skills =
      presenter.getClientPlayer() &&
      presenter.getClientPlayer().CharacterId !== undefined
        ? presenter
            .getClientPlayer()
            .getPlayerSkills(undefined, true)
            .filter((skill) => !skill.isShadowSkill())
        : [];

    return (
      <>
        <div className={styles.playerSkills}>
          {skills.map((skill, index) => (
            <SkillButton
              key={index}
              imageLoader={imageLoader}
              translator={translator}
              skill={skill}
              selected={skillSelected && props.store.selectedSkill === skill}
              size={
                skills.length % 2 === 0
                  ? "normal"
                  : index === skills.length - 1
                  ? "wide"
                  : "normal"
              }
              className={styles.playerSkill}
              onClick={onClickSkill(skill)}
              disabled={isSkillDisabled(skill)}
            />
          ))}
        </div>
        <div className={styles.userSideEffectSkillList}>
          {getSideEffectSkills()}
        </div>
      </>
    );
  }

  let onClickUniqueSkillTag =
    (name: string, items: (Card | Character)[]) => () => {
      if (openedDialog === name) {
        openedDialog = undefined;
        props.presenter.closeViewDialog();
      } else {
        openedDialog = name;
        props.presenter.createViewDialog(
          <CardSelectorDialog
            title={props.translator.tr(name)}
            isCharacterCard={items[0] instanceof Character}
            imageLoader={props.imageLoader}
            options={items.map((item) => item.Id)}
            translator={props.translator}
          />
        );
      }
    };

  function getSkillTags(viewer: PlayerId) {
    const { translator, presenter } = props;
    const player = presenter.getClientPlayer();
    if (!player) {
      return undefined;
    }

    const flags = player.getAllVisibleTags(viewer);
    return (
      flags && (
        <div className={styles.skillTags}>
          {flags.map((flag, index) => {
            const items = System.SkillTagsTransformer[flag]?.(
              player.getFlag(flag)
            );
            return (
              <span
                key={index}
                className={classNames(styles.skillTag, {
                  [styles.clickable]: !!items,
                })}
                onClick={
                  items && items.length > 0
                    ? onClickUniqueSkillTag(flag, items)
                    : undefined
                }
              >
                {translator.trx(flag)}
              </span>
            );
          })}
        </div>
      )
    );
  }

  let onOutsideAreaTagClicked =
    (name: string, cards: (CardId | CharacterId)[]) => () => {
      const player = props.presenter.getClientPlayer();
      if (
        player === undefined ||
        player.CharacterId === undefined ||
        (openedDialog === undefined && props.store.selectorDialog !== undefined)
      ) {
        return;
      }

      if (openedDialog === name) {
        openedDialog = undefined;
        props.presenter.closeViewDialog();
      } else {
        openedDialog = name;
        props.presenter.createViewDialog(
          <CardSelectorDialog
            title={props.translator.tr(name)}
            isCharacterCard={player.isCharacterOutsideArea(name)}
            imageLoader={props.imageLoader}
            options={cards}
            translator={props.translator}
          />
        );
      }
    };

  function getOutsideAreaCards() {
    const { translator, presenter } = props;
    const cards = presenter.getClientPlayer()?.getOutsideAreaCards();
    return (
      cards && (
        <div className={styles.outsideArea}>
          {Object.entries<CardId[]>(cards)
            .map(([areaName, cards], index) =>
              cards.length === 0 ? undefined : (
                <span
                  key={index}
                  className={classNames(
                    styles.skillTag,
                    styles.clickableSkillTag
                  )}
                  onClick={onOutsideAreaTagClicked(areaName, cards)}
                >
                  [{translator.tr(areaName)}
                  {cards.length}]
                </span>
              )
            )
            .filter(Boolean)}
        </div>
      )
    );
  }

  function getSideEffectSkills() {
    const { translator, imageLoader, store, isSkillDisabled } = props;

    const player = props.presenter.getClientPlayer();
    if (player === undefined || player.CharacterId === undefined) {
      return;
    }

    return store.room
      .getSideEffectSkills(player)
      .filter((skillName) => !Sanguosha.isShadowSkillName(skillName))
      .map((skillName, index) => {
        const skill = Sanguosha.getSkillBySkillName(skillName);
        return (
          <SkillButton
            imageLoader={imageLoader}
            translator={translator}
            skill={skill}
            selected={skillSelected && props.store.selectedSkill === skill}
            size="normal"
            key={index}
            className={classNames(styles.playerSkill, styles.sideSkill)}
            disabled={props.store.room.isGameOver() || isSkillDisabled(skill)}
            onClick={() => onClickSkill(skill)}
          />
        );
      });
  }

  let openTooltip = () => {
    onTooltipOpeningTimer.current = setTimeout(() => {
      setOnTooltipOpened(() => true);
    }, 500);
  };

  let closeTooltip = () => {
    onTooltipOpeningTimer.current &&
      clearTimeout(onTooltipOpeningTimer.current);
    setOnTooltipOpened(() => false);
  };

  let hideOrShowRelatedSkills = () => {
    setHideRelatedSkills(() => !hideRelatedSkills);
  };

  function createTooltipContent(getRelatedSkills?: boolean) {
    const { translator, presenter } = props;
    let skills =
      presenter.getClientPlayer()?.CharacterId !== undefined
        ? presenter
            .getClientPlayer()
            .getPlayerSkills()
            .filter((skill) => !skill.isShadowSkill())
        : [];
    getRelatedSkills &&
      (skills = skills.reduce<Skill[]>((relatedSkills, skill) => {
        if (skill.RelatedSkills.length === 0) {
          return relatedSkills;
        }

        const notHave = skill.RelatedSkills.filter(
          (skillName) => !skills.map((skill) => skill.Name).includes(skillName)
        );
        return relatedSkills.concat(
          ...notHave.map((skillName) =>
            Sanguosha.getSkillBySkillName(skillName)
          )
        );
      }, []));
    return getRelatedSkills
      ? hideRelatedSkills
        ? skills.length > 0 && (
            <span
              className={styles.relatedSkillTiltle}
              onClick={hideOrShowRelatedSkills}
            >
              {props.translator.trx("related skill (click to show)")}
            </span>
          )
        : skills.map((skill, index) => (
            <div className={styles.skillInfo} key={index}>
              {index === 0 && (
                <span
                  className={styles.relatedSkillTiltle}
                  onClick={hideOrShowRelatedSkills}
                >
                  {props.translator.trx("related skill (click to hide)")}
                </span>
              )}
              <div className={styles.skillItem}>
                <span
                  className={classNames(styles.skillName, styles.relatedSkill)}
                >
                  {translator.trx(skill.Name)}
                </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: translator.tr(skill.Description),
                  }}
                />
              </div>
            </div>
          ))
      : skills.map((skill, index) => (
          <div className={styles.skillInfo} key={index}>
            <div className={styles.skillItem}>
              <span className={styles.skillName}>
                {translator.trx(skill.Name)}
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: translator.tr(
                    skill.dynamicDescription(presenter.getClientPlayer())
                  ),
                }}
              />
            </div>
          </div>
        ));
  }

  async function updateMainImage() {
    if (
      props.presenter.getClientPlayer() &&
      props.presenter.getClientPlayer().CharacterId !== undefined &&
      props.skinData
    ) {
      props.imageLoader
        .getCharacterSkinPlay(
          props.presenter.getClientPlayer().Character.Name,
          props.skinData,
          props.presenter.getClientPlayer().Id,
          skinName
        )
        .then((imageProps: ImageProps) => {
          if (imageProps) {
            setNewMainImage(() => imageProps);
          }
        });
    }
  }

  function renderCharacterImage() {
    if (
      props.presenter.getClientPlayer() &&
      props.presenter.getClientPlayer().CharacterId !== undefined
    ) {
      if (props.skinData) {
        skinName = getSkinName(
          props.presenter.getClientPlayer().Character?.Name,
          props.presenter.getClientPlayer()?.Id,
          props.skinData
        ).skinName;

        props.imageLoader
          .getCharacterSkinPlay(
            props.presenter.getClientPlayer().Character.Name,
            props.skinData,
            props.presenter.getClientPlayer().Id,
            skinName
          )
          .then((image: ImageProps) => {
            if (image) {
              setMainImage(() => image);
            }
          });
      } else {
        props.imageLoader
          .getCharacterImage(props.presenter.getClientPlayer().Character.Name)
          .then((image: ImageProps) => {
            if (mainImage?.src !== image.src) {
              if (image) {
                setMainImage(() => image);
              }
            }
          });
      }

      const huashenCharacterId = props.presenter
        .getClientPlayer()
        .getHuaShenInfo()?.characterId;
      const huashenCharacter =
        huashenCharacterId !== undefined
          ? Sanguosha.getCharacterById(huashenCharacterId)
          : undefined;
      if (huashenCharacter) {
        props.imageLoader
          .getCharacterImage(
            huashenCharacter.Name,
            props.presenter.getClientPlayer().Id
          )
          .then((image: ImageProps) => {
            if (sideImage?.src !== image.src) {
              setSideImage(() => image);
            }
          });
      }
    }
  }
  async function getImage() {
    if (
      PlayerImage === undefined &&
      props.presenter.getClientPlayer() &&
      props.presenter.getClientPlayer().CharacterId !== undefined
    ) {
      if (mainImage) {
        setPlayerImage(() => () => (
          <SwitchAvatar
            mainImage={mainImage?.src}
            sideImage={sideImage?.src}
            className={classNames(styles.playerImage, {
              [styles.dead]:
                props.presenter.getClientPlayer() &&
                props.presenter.getClientPlayer().Dead,
              [styles.disabled]:
                props.delight === false
                  ? false
                  : !(
                      props.presenter.getClientPlayer() &&
                      props.presenter.getClientPlayer().Dead
                    ) && props.disabled,
            })}
          />
        ));
      }
    } else if (
      PlayerRoleCard === undefined &&
      props.presenter.getClientPlayer() &&
      props.presenter.getClientPlayer().Dead &&
      props.presenter.getClientPlayer().Role !== PlayerRole.Unknown
    ) {
      const image = await props.imageLoader.getPlayerRoleCard(
        props.presenter.getClientPlayer().Role,
        props.store.room.Info.gameMode
      );
      if (image) {
        setPlayerRoleCard(() => (
          <Picture className={styles.playerRoleCard} image={image} />
        ));
      }
    }
  }
  React.useEffect(() => {
    if (props.presenter.getClientPlayer()?.Character) {
      renderCharacterImage();
    }
    getImage();
  });

  let onfocusedSkin = (skinName: string) => {
    const clientPlayer = props.presenter.getClientPlayer();
    const character =
      clientPlayer?.CharacterId !== undefined
        ? clientPlayer?.Character
        : undefined;
    if (clientPlayer && character && props.skinData) {
      skinName = getSkinName(
        clientPlayer.Character?.Name,
        clientPlayer?.Id,
        props.skinData,
        skinName
      ).skinName;
    }
    updateMainImage();
    if (newMainImage?.src !== mainImage?.src) {
      setPlayerImage(() => () => (
        <SwitchAvatar
          mainImage={newMainImage?.src}
          sideImage={sideImage?.src}
          className={classNames(styles.playerImage, {
            [styles.dead]:
              props.presenter.getClientPlayer() &&
              props.presenter.getClientPlayer().Dead,
            [styles.disabled]:
              props.delight === false
                ? false
                : !(
                    props.presenter.getClientPlayer() &&
                    props.presenter.getClientPlayer().Dead
                  ) && props.disabled,
          })}
        />
      ));
    }
    props.presenter.closeViewDialog();
  };

  let selectedSkin = () => {
    if (inProcessDialog) {
      props.presenter.closeViewDialog();
      inProcessDialog = false;
    } else if (props.skinData) {
      inProcessDialog = true;
      props.presenter.createViewDialog(
        <SkinSelectorDialog
          translator={props.translator}
          imageLoader={props.imageLoader}
          playerId={
            props.presenter.getClientPlayer()
              ? props.presenter.getClientPlayer().Id
              : ""
          }
          // onClick={onfocusedSkin}
          skinData={props.skinData}
          character={
            props.presenter.getClientPlayer()
              ? props.presenter.getClientPlayer().Character.Name
              : ""
          }
        />
      );
    }
  };
  let onCloseIncomingMessageCallback = () => {
    props.onCloseIncomingMessage && props.onCloseIncomingMessage();
  };

  function getOnceSkillMarks() {
    const clientPlayer = props.presenter.getClientPlayer();
    if (!clientPlayer || clientPlayer.CharacterId === undefined) {
      return;
    }

    const marks: JSX.Element[] = [];
    const limitSkills = clientPlayer.getSkills("limit");
    const awakenSkills = clientPlayer.getSkills("awaken");
    const switchSkills = clientPlayer
      .getSkills("switch")
      .filter((skill) => !skill.isShadowSkill());
    marks.push(
      ...limitSkills.map((skill) => (
        <LimitSkillMark
          skillName={props.translator.tr(skill.Name)}
          hasUsed={props.store.onceSkillUsedHistory[clientPlayer.Id]?.includes(
            skill.Name
          )}
          key={skill.Name}
          tagPosition="left"
        />
      ))
    );
    marks.push(
      ...awakenSkills.map((skill) => (
        <AwakenSkillMark
          skillName={props.translator.tr(skill.Name)}
          hasUsed={props.store.onceSkillUsedHistory[clientPlayer.Id]?.includes(
            skill.Name
          )}
          key={skill.Name}
          tagPosition="left"
        />
      ))
    );
    marks.push(
      ...switchSkills.map((skill) => (
        <SwitchSkillMark
          skillName={props.translator.tr(skill.Name)}
          state={props.store.switchSkillState[clientPlayer.Id]?.includes(
            skill.Name
          )}
          key={skill.Name}
          tagPosition="left"
        />
      ))
    );

    const playerMarks = clientPlayer.Marks;
    for (const [markName, amount] of Object.entries(playerMarks)) {
      marks.push(
        <Mark amount={amount} markType={markName as MarkEnum} key={markName} />
      );
    }

    return marks;
  }

  const clientPlayer = props.presenter.getClientPlayer();
  const character =
    clientPlayer?.CharacterId !== undefined
      ? clientPlayer?.Character
      : undefined;

  return (
    <>
      <div
        className={classNames(styles.playerCard)}
        onClick={onClick}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onMouseOver={showPlayerName}
        onMouseOut={hidePlayerName}
      >
        {props.incomingMessage && (
          <Tooltip
            className={styles.incomingMessage}
            position={["slightTop"]}
            closeAfter={3}
            closeCallback={onCloseIncomingMessageCallback}
          >
            {props.incomingMessage}
          </Tooltip>
        )}
        <span
          className={classNames(styles.playerName, {
            [styles.autoHide]: character && autoHidePlayerName,
          })}
        >
          {clientPlayer?.Name}
        </span>
        <span
          className={classNames(styles.highlightBorder, {
            [styles.selected]: props.selected && !props.disabled,
          })}
        />
        {PlayerImage !== undefined && <PlayerImage />}
        {clientPlayer && character && (
          <NationalityBadge
            nationality={clientPlayer.Nationality}
            className={styles.playCharacterName}
            onClick={selectedSkin}
          >
            {props.translator.tr(character.Name)}
          </NationalityBadge>
        )}
        {clientPlayer && clientPlayer.Role !== PlayerRole.Unknown && (
          <Mask
            className={styles.playerRole}
            displayedRole={clientPlayer.Role}
            gameMode={props.store.room.Info.gameMode}
            lockedRole={
              clientPlayer.Dead || clientPlayer.Role === PlayerRole.Lord
                ? clientPlayer.Role
                : undefined
            }
            hideDisplay={true}
          />
        )}

        {!clientPlayer?.isFaceUp() && (
          <Picture
            className={styles.status}
            image={props.imageLoader.getTurnedOverCover()}
          />
        )}
        {clientPlayer && clientPlayer.hasDrunk() > 0 && (
          <div className={styles.drunk} />
        )}
        {clientPlayer && clientPlayer.ChainLocked && (
          <Picture
            className={styles.chain}
            image={props.imageLoader.getChainImage()}
          />
        )}

        {PlayerRoleCard !== undefined && <PlayerRoleCard />}

        {getSkillButtons()}
        {clientPlayer && (
          <>
            <Armor amount={clientPlayer.Armor} />
            <Hp
              hp={clientPlayer.Hp}
              className={styles.playerHp}
              maxHp={clientPlayer.MaxHp}
              size="regular"
            />
          </>
        )}
        <div className={styles.playerTags}>
          {clientPlayer && getSkillTags(clientPlayer.Id)}
          {getOutsideAreaCards()}
        </div>
        {onTooltipOpened && clientPlayer?.CharacterId !== undefined && (
          <Tooltip position={["left"]}>
            {createTooltipContent()}
            {createTooltipContent(true)}
          </Tooltip>
        )}
      </div>
      <div className={styles.marks}>{getOnceSkillMarks()}</div>
    </>
  );
}
