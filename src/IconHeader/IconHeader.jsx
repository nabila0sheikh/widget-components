import React from 'react';
import PropTypes from 'prop-types';
import styles from './IconHeader.scss';

const IconHeader = ({ title, subtitle, children }) => (
   <header className={`KambiWidget-card-text-color KambiWidget-card-border-color KambiWidget-font ${styles.header}`}>
      <div className={styles.icon}>{children}</div>
      <div className={styles.container}>
         <div className={styles.title} title={title}>{title}</div>
         <div className={styles.subtitle} title={subtitle}>{subtitle}</div>
      </div>
   </header>
);

/**
 * @property [children] {ReactElement} Header's icon markup
 * @property title {string} Header's title
 * @property [subtitle] {string} Header's subtitle
 */
IconHeader.propTypes = {
   children: PropTypes.node,
   title: PropTypes.string.isRequired,
   subtitle: PropTypes.string
};

export default IconHeader;
