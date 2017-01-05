import React, { Component, PropTypes } from 'react';
import styles from './IconHeader.scss';

const IconHeader = ({ title, subtitle, children }) => {
   return (
      <header className={`KambiWidget-card-border-color KambiWidget-font ${styles.header}`}>
         <div className={styles.icon}>{children}</div>
         <div className={styles.container}>
            <div className={styles.title}>{title}</div>
            <div className={styles.subtitle}>{subtitle}</div>
         </div>
      </header>);
};

/**
 * @property [children] {ReactElement} Header's icon markup
 * @property title {string} Header's title
 * @property [subtitle] {string} Header's subtitle
 */
IconHeader.propTypes = {
   children: PropTypes.node,
   title: React.PropTypes.string.isRequired,
   subtitle: React.PropTypes.string
};

export default IconHeader;
