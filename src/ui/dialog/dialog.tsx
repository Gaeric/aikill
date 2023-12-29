import classNames from 'classnames';
import * as React from 'react';
import styles from './dialog.module.css';

export function Dialog(props: { className?: string; children?: React.ReactNode; onClose?(): void }) {
  const [moving, setMoving] = React.useState(false);

  let onElementRendered = React.useRef<HTMLDivElement>();

  const [topOffset, setTopOffset] = React.useState<number>();
  const [leftOffset, setLeftOffset] = React.useState<number>();

  const [posX, setPosX] = React.useState<number>(0);
  const [posY, setPosY] = React.useState<number>(0);

  let onMouseDown = (e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) => {
    if (e.currentTarget !== e.target) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    setMoving(() => true);

    setPosX(
      () =>
        (e as React.MouseEvent<HTMLElement, MouseEvent>).clientX ||
        (e as React.TouchEvent<HTMLElement>).touches[0].clientX,
    );
    setPosY(
      () =>
        (e as React.MouseEvent<HTMLElement, MouseEvent>).clientY ||
        (e as React.TouchEvent<HTMLElement>).touches[0].clientY,
    );
  };

  function onMouseMove(e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) {
    if (!moving || e.currentTarget !== e.target) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    const clientX =
      (e as React.MouseEvent<HTMLElement, MouseEvent>).clientX ||
      (e as React.TouchEvent<HTMLElement>).touches[0].clientX;
    const clientY =
      (e as React.MouseEvent<HTMLElement, MouseEvent>).clientY ||
      (e as React.TouchEvent<HTMLElement>).touches[0].clientY;

    let currentTopOffset = topOffset ? topOffset : 0;
    let currentLeftOffset = leftOffset ? leftOffset : 0;

    currentLeftOffset += clientX - posX;
    currentTopOffset += clientY - posY;

    setTopOffset(() => currentTopOffset);
    setLeftOffset(() => currentLeftOffset);

    setPosX(() => clientX);
    setPosY(() => clientY);
  }

  let onMouseUp = (e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) => {
    if (e.currentTarget !== e.target) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    setMoving(() => false);
  };

  React.useEffect(() => {
    if (!onElementRendered.current) {
      return;
    }
    if (!topOffset && !leftOffset) {
      setTopOffset(onElementRendered.current.getBoundingClientRect().top);
      setLeftOffset(onElementRendered.current.getBoundingClientRect().left);
    }
  });

  return (
    <>
      {props.onClose ? <div className={styles.Curtain} onClick={props.onClose}></div> : <></>}
      <div
        className={classNames(styles.dialog, props.className)}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchMove={onMouseMove}
        ref={onElementRendered}
        style={{ top: topOffset, left: leftOffset }}
      >
        {props.children}
      </div>
    </>
  );
}
