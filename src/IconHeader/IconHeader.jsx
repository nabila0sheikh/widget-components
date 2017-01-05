import React, { Component } from 'react';
import styles from './IconHeader.scss';

const IconHeader = ({ iconPath, title, subtitle }) => {
   return (
      <header className={['KambiWidget-card-border-color', 'KambiWidget-font', styles.header].join(' ')}>
         <img role='presentation' className={styles.logo} src={iconPath} />
         <div className={styles.container}>
            <div className={styles.title}>{title}</div>
            <div className={styles.subtitle}>{subtitle}</div>
         </div>
      </header>);
};

IconHeader.propTypes = {
   iconPath: React.PropTypes.string,
   title: React.PropTypes.string,
   subtitle: React.PropTypes.string,
};

export default IconHeader;
