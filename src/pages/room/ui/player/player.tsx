import classNames from "classnames";
import { Card, CardType } from "src/core/cards/card";
import { CardId } from "src/core/cards/libs/card_props";
import {
  Character,
  CharacterEquipSections,
} from "src/core/characters/character";
import { Sanguosha } from "src/core/game/engine";
import { PlayerPhase } from "src/core/game/stage_processor";
import { ClientPlayer } from "src/core/player/player.client";
import {
  PlayerCardsArea,
  PlayerId,
  PlayerRole,
  PlayerStatus,
} from "src/core/player/player_props";
import { System } from "src/core/shares/libs/system";
import { MarkEnum } from "src/core/shares/types/mark_list";
import { GameMode } from "src/core/shares/types/room_props";
import { Skill } from "src/core/skills/skill";
import { ClientTranslationModule } from "src/core/translations/translation_module.client";
import { ImageLoader } from "src/image_loader/image_loader";
import { RoomPresenter } from "src/pages/room/room.presenter";
import { RoomStore } from "src/pages/room/room.store";
import { ImageProps } from "src/props/image_props";
import * as React from "react";
import { CharacterSkinInfo } from "src/skins/skins";
import { Armor } from "src/ui/armor/armor";
import { NationalityBadge, PlayerPhaseBadge } from "src/ui/badge/badge";
import { ClientCard } from "src/ui/card/card";
import { FlatClientCard } from "src/ui/card/flat_card";
import { Hp } from "src/ui/hp/hp";
import { Picture } from "src/ui/picture/picture";
import { Tooltip } from "src/ui/tooltip/tooltip";
import styles from "./player.module.css";
import { getSkinName } from "../../ui/switch_avatar/switch_skin";
import { CardSelectorDialog } from "../dialog/card_selector_dialog/card_selector_dialog";
import { DelayedTrickIcon } from "../icon/delayed_trick_icon";
import { JudgeAreaDisabledIcon } from "../icon/judge_area_disabled_icon";
import {
  AwakenSkillMark,
  LimitSkillMark,
  Mark,
  SwitchSkillMark,
} from "../mark/mark";
import { Mask } from "../mask/mask";
import { PlayingBar } from "../playing_bar/playing_bar";
import { SwitchAvatar } from "../switch_avatar/switch_avatar";

type PlayerCardProps = {
  player: ClientPlayer | undefined;
  playerPhase?: PlayerPhase;
  translator: ClientTranslationModule;
  presenter: RoomPresenter;
  imageLoader: ImageLoader;
  inAction: boolean;
  store: RoomStore;
  skinData?: CharacterSkinInfo[];
  incomingMessage?: string;
  onCloseIncomingMessage?(): void;
  actionTimeLimit?: number;
  disabled?: boolean;
  delight?: boolean;
  onClick?(selected: boolean): void;
  selected?: boolean;
};

export function PlayerCard(props: PlayerCardProps) {
  const [onTooltipOpened, setOnTooltipOpened] = React.useState(false);
  const [PlayerImage, setPlayerImage] = React.useState<() => JSX.Element>();
  const [PlayerRoleCard, setPlayerRoleCard] =
    React.useState<() => JSX.Element>();
  const [mainImage, setMainImage] = React.useState<ImageProps | undefined>();
  const [sideImage, setSideImage] = React.useState<ImageProps | undefined>();
  const [focusedOnPlayerHandcard, setFocusedOnPlayerHandcard] =
    React.useState(false);
  const [autoHidePlayerName, setAutoHidePlayerName] = React.useState(true);
  const [skinName, setSkinName] = React.useState<string>();
  const [hideRelatedSkills, setHideRelatedSkills] = React.useState(true);

  function showPlayerHandcards() {
    return (
      props.store.room.Info.gameMode === GameMode.TwoVersusTwo &&
      props.presenter.getClientPlayer() &&
      props.player &&
      props.presenter.getClientPlayer().Role === props.player.Role
    );
  }

  const onTooltipOpeningTimer = React.useRef<null | ReturnType<
    typeof setTimeout
  >>();
  let openedDialog: string | undefined;
  let ifDead: boolean;

  // const [PlayerCharacter, setPlayerCharacter] = React.useState(
  //   props.player && props.player.Character
  // );
  let PlayerCharacter = props.player && props.player?.Character;
  function onClick() {
    if (props.disabled === false) {
      props.onClick && props.onClick(!props.selected);
    }
  }

  function showPlayerName() {
    setAutoHidePlayerName(() => false);
  }

  function hidePlayerName() {
    setAutoHidePlayerName(() => true);
  }

  // 原get
  // function PlayerCharacter {
  //   if (props.player === undefined) {
  //     return undefined;
  //   }

  //   try {
  //     return props.player.CharacterId !== undefined
  //       ? props.player.Character
  //       : undefined;
  //   } catch {
  //     return undefined;
  //   }
  // }

  function getPlayerEquips() {
    const { player, translator, imageLoader } = props;
    const equips = player
      ?.getCardIds(PlayerCardsArea.EquipArea)
      .map((cardId) => Sanguosha.getCardById(cardId));
    if (!equips) {
      return;
    }

    return (
      <>
        <div className={styles.playerEquips} onClick={onClick}>
          {equips.map((equip) => (
            <FlatClientCard
              card={equip}
              key={equip.Id}
              imageLoader={imageLoader}
              translator={translator}
              className={classNames(styles.playerEquip, {
                [styles.weapon]: equip?.is(CardType.Weapon),
                [styles.armor]: equip?.is(CardType.Shield),
                [styles.defenseRide]: equip?.is(CardType.DefenseRide),
                [styles.offenseRide]: equip?.is(CardType.OffenseRide),
                [styles.precious]: equip?.is(CardType.Precious),
              })}
            />
          ))}
        </div>
        {player && (
          <PlayerAbortedEquipSection
            player={player}
            imageLoader={imageLoader}
          />
        )}
      </>
    );
  }

  function getPlayerJudgeCards() {
    const judgeAreaDisabled = props.player?.judgeAreaDisabled();

    return (
      <div className={styles.judgeIcons}>
        {judgeAreaDisabled ? <JudgeAreaDisabledIcon /> : <></>}
        {props.player?.getCardIds(PlayerCardsArea.JudgeArea).map((cardId) => (
          <DelayedTrickIcon
            imageLoader={props.imageLoader}
            card={Sanguosha.getCardById(cardId)}
            key={cardId}
            translator={props.translator}
          />
        ))}
      </div>
    );
  }

  function openTooltip(event: React.MouseEvent<HTMLSpanElement>) {
    onTooltipOpeningTimer.current = setTimeout(() => {
      setOnTooltipOpened(true);
    }, 500);
  }

  function closeTooltip(event: React.MouseEvent<HTMLSpanElement>) {
    onTooltipOpeningTimer.current &&
      clearTimeout(onTooltipOpeningTimer.current);
    setOnTooltipOpened(false);
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
    const { translator, player } = props;
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

  let onOutsideAreaTagClicked = (name: string, cards: CardId[]) => () => {
    if (openedDialog === name) {
      openedDialog = undefined;
      props.presenter.closeViewDialog();
    } else {
      openedDialog = name;
      props.presenter.createViewDialog(
        <CardSelectorDialog
          imageLoader={props.imageLoader}
          options={cards}
          translator={props.translator}
        />
      );
    }
  };

  function getOutsideAreaCards() {
    const { translator, player } = props;
    const cards = player?.getOutsideAreaCards();
    return (
      cards && (
        <div className={styles.outsideArea}>
          {Object.entries<CardId[]>(cards)
            .map(([areaName, cards], index) =>
              cards.length === 0 ? undefined : (
                <span
                  key={index}
                  className={classNames(styles.skillTag, {
                    [styles.clickableSkillTag]:
                      player!.isOutsideAreaVisible(areaName),
                  })}
                  onClick={
                    player!.isOutsideAreaVisible(areaName)
                      ? onOutsideAreaTagClicked(areaName, cards)
                      : undefined
                  }
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

  function hideOrShowRelatedSkills() {
    setHideRelatedSkills(!hideRelatedSkills);
  }

  function createTooltipContent(getRelatedSkills?: boolean) {
    const { player, translator } = props;
    let skills =
      player?.CharacterId !== undefined
        ? player.getPlayerSkills().filter((skill) => !skill.isShadowSkill())
        : [];

    getRelatedSkills &&
      (skills = skills.reduce((relatedSkills, skill) => {
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
                  __html: translator.tr(skill.dynamicDescription(player!)),
                }}
              />
            </div>
          </div>
        ));
  }

  function renderCharacterImage() {
    if (PlayerCharacter && props.player) {
      if (props.skinData) {
        setSkinName(
          getSkinName(
            props.player.Character.Name,
            props.player?.Id,
            props.skinData
          ).skinName
        );

        props.imageLoader
          .getCharacterSkinPlay(
            props.player?.Character.Name,
            props.skinData,
            props.player?.Id,
            skinName
          )
          .then((image) => setMainImage(() => image));
      } else {
        props.imageLoader
          .getCharacterImage(PlayerCharacter.Name)
          .then((image) => {
            if (mainImage?.src !== image.src) {
              setMainImage(() => image);
            }
          });
      }
      const huashenCharacterId = props.player?.getHuaShenInfo()?.characterId;
      const huashenCharacter =
        huashenCharacterId !== undefined
          ? Sanguosha.getCharacterById(huashenCharacterId)
          : undefined;

      if (huashenCharacter) {
        props.imageLoader
          .getCharacterImage(huashenCharacter.Name, props.player?.Id)
          .then((image) => {
            if (sideImage?.src !== image.src) {
              setSideImage(() => image);
            }
          });
      }
    }
  }
  async function getImage() {
    if (PlayerImage === undefined && PlayerCharacter && mainImage) {
      setPlayerImage(() => (
        <SwitchAvatar
          mainImage={mainImage?.src}
          sideImage={sideImage?.src}
          className={classNames(styles.playerImage, {
            [styles.dead]: props.player && props.player.Dead,
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
    } else if (
      props.player &&
      ifDead !== props.player.Dead &&
      props.player.Dead &&
      props.player.Role !== PlayerRole.Unknown
    ) {
      const image = await props.imageLoader.getPlayerRoleCard(
        props.player.Role,
        props.store.room.Info.gameMode,
        props.presenter.getClientPlayer()?.Role
      );
      if (image) {
        setPlayerRoleCard(() => (
          <Picture className={styles.playerRoleCard} image={image} />
        ));
      }
    } else if (
      props.player &&
      ifDead !== props.player.Dead &&
      !props.player.Dead &&
      props.player.Role !== PlayerRole.Unknown
    ) {
      setPlayerRoleCard(() => <></>);
    }
  }
  React.useEffect(() => {
    // if (props.player && !PlayerCharacter) {
    //   setPlayerCharacter(() => props.player!.Character);
    // }
    ifDead = props.player ? props.player.Dead : ifDead;

    getImage();
  });
  React.useEffect(() => {
    if (PlayerCharacter) {
      renderCharacterImage();
    }
  }, [PlayerCharacter]);

  let onCloseIncomingMessageCallback = () => {
    props.onCloseIncomingMessage && props.onCloseIncomingMessage();
  };

  function getOnceSkillMarks() {
    const clientPlayer = props.player;
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

  function isPlayerRoleLocked(player: ClientPlayer) {
    const { gameMode } = props.store.room.Info;
    return (
      gameMode === GameMode.OneVersusTwo ||
      gameMode === GameMode.TwoVersusTwo ||
      player.Dead ||
      player.Role === PlayerRole.Lord
    );
  }

  let onFocusPlayerHandcard = () => {
    setFocusedOnPlayerHandcard(!focusedOnPlayerHandcard);
  };

  const {
    disabled,
    translator,
    inAction,
    player,
    playerPhase,
    imageLoader,
    incomingMessage,
    actionTimeLimit,
  } = props;

  return (
    <div
      className={styles.player}
      onMouseOver={showPlayerName}
      onMouseOut={hidePlayerName}
    >
      <div
        id={player && player.Id}
        className={styles.playerCard}
        onClick={onClick}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
      >
        {incomingMessage && (
          <Tooltip
            className={styles.incomingMessage}
            position={["slightTop"]}
            closeAfter={3}
            closeCallback={onCloseIncomingMessageCallback}
          >
            {incomingMessage}
          </Tooltip>
        )}
        {player ? (
          <>
            <p
              className={classNames(styles.playerName, {
                [styles.aligned]: PlayerCharacter !== undefined,
                [styles.autoHide]: PlayerCharacter && autoHidePlayerName,
              })}
            >
              {player.Name}
            </p>
            {PlayerCharacter ? (
              <>
                <span
                  className={classNames(styles.highlightBorder, {
                    [styles.selected]: props.selected && !disabled,
                    [styles.highlighted]: playerPhase !== undefined,
                  })}
                />
                {PlayerImage !== undefined && PlayerImage}
                {PlayerRoleCard !== undefined && PlayerRoleCard}
                {props.player && props.player.CharacterId !== undefined && (
                  <NationalityBadge
                    className={styles.playerCharacter}
                    nationality={props.player.Nationality}
                  >
                    {translator.tr(PlayerCharacter.Name)}
                  </NationalityBadge>
                )}
                {player.Role !== PlayerRole.Unknown && (
                  <Mask
                    className={styles.playerRole}
                    gameMode={props.store.room.Info.gameMode}
                    lockedRole={
                      isPlayerRoleLocked(player) ? player.Role : undefined
                    }
                  />
                )}
                <div className={styles.playerHp}>
                  <Armor amount={player.Armor} />
                  <Hp hp={player.Hp} maxHp={player.MaxHp} size="small" />
                </div>
                <span
                  className={classNames(styles.handCardsNumberBg, {
                    [styles.clickableHandcards]: showPlayerHandcards(),
                  })}
                  onClick={onFocusPlayerHandcard}
                >
                  <Picture
                    className={styles.handCardsNumberBgImage}
                    image={imageLoader.getCardNumberBgImage()}
                  />
                  <span className={styles.handCardsNumber}>
                    {player.getCardIds(PlayerCardsArea.HandArea).length}
                  </span>
                  {showPlayerHandcards() &&
                    focusedOnPlayerHandcard &&
                    props.player && (
                      <Tooltip
                        position={["right", "bottom"]}
                        className={styles.tooltip}
                      >
                        {props.player
                          .getCardIds(PlayerCardsArea.HandArea)
                          .map((cardId) => (
                            <ClientCard
                              width={80}
                              card={Sanguosha.getCardById(cardId)}
                              translator={props.translator}
                              imageLoader={props.imageLoader}
                            />
                          ))}
                      </Tooltip>
                    )}
                </span>
              </>
            ) : (
              <Picture
                className={classNames(
                  styles.playerImage,
                  styles.playerUnknownImage
                )}
                image={imageLoader.getUnknownCharacterImage()}
              />
            )}
            {getPlayerJudgeCards()}
            {!player.isFaceUp() && (
              <Picture
                className={styles.status}
                image={imageLoader.getTurnedOverCover()}
              />
            )}
            {player.hasDrunk() > 0 && <div className={styles.drunk} />}
            {player.ChainLocked && (
              <Picture
                className={styles.chain}
                image={imageLoader.getChainImage()}
              />
            )}

            <p className={styles.playerSeats}>
              {translator.tr(`seat ${player.Position}`)}
            </p>
          </>
        ) : (
          <Picture
            className={classNames(
              styles.playerImage,
              styles.playerUnknownImage
            )}
            image={imageLoader.getEmptySeatImage()}
          />
        )}
        {playerPhase !== undefined && (
          <PlayerPhaseBadge
            stage={playerPhase}
            translator={translator}
            className={styles.playerPhaseBadge}
          />
        )}
        <div className={styles.playerTags}>
          {props.presenter.getClientPlayer() &&
            getSkillTags(props.presenter.getClientPlayer().Id)}
          {getOutsideAreaCards()}
        </div>
        {player && player.Status !== PlayerStatus.Online && (
          <span className={styles.playerStatus}>
            {translator.tr(player.Status || "")}
          </span>
        )}
        {inAction && (
          <PlayingBar className={styles.playBar} playTime={actionTimeLimit} />
        )}
        {onTooltipOpened && PlayerCharacter && (
          <Tooltip position={["center", "right"]}>
            {createTooltipContent()}
            {createTooltipContent(true)}
          </Tooltip>
        )}
      </div>
      {getPlayerEquips()}
      <div className={styles.marks}>{getOnceSkillMarks()}</div>
    </div>
  );
}

type PlayerAbortedEquipSectionProps = {
  player: ClientPlayer;
  imageLoader: ImageLoader;
};

function PlayerAbortedEquipSection(props: PlayerAbortedEquipSectionProps) {
  const [abortedImageProp, setAbortedImageProp] = React.useState<
    ImageProps | undefined
  >();

  async function getImage() {
    let url = await props.imageLoader.getOthersAbortedEquipCard();
    setAbortedImageProp(() => url);
  }
  React.useEffect(() => {
    if (!abortedImageProp) {
      getImage();
    }
  });

  const abortedSections = props.player.DisabledEquipSections;

  return (
    <div className={styles.playerAbortedEquipSections}>
      {abortedImageProp &&
        abortedSections.map((section) => (
          <Picture
            className={classNames(styles.playerEquip, {
              [styles.weapon]: section === CharacterEquipSections.Weapon,
              [styles.armor]: section === CharacterEquipSections.Shield,
              [styles.defenseRide]:
                section === CharacterEquipSections.DefenseRide,
              [styles.offenseRide]:
                section === CharacterEquipSections.OffenseRide,
              [styles.precious]: section === CharacterEquipSections.Precious,
            })}
            key={section}
            image={abortedImageProp!}
          />
        ))}
    </div>
  );
}
