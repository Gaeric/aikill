import { ImageProps } from '/src/props/image_props';
import * as React from 'react';
import { Picture } from '/src/ui/picture/picture';
import styles from './background.module.css';

export type BackgroundProps = {
  image: ImageProps;
};

export const Background = ({ image }: BackgroundProps) => <Picture className={styles.bg} image={image} />;
