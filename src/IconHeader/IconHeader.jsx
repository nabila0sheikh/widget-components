import React from 'react';
import PropTypes from 'prop-types';
import styles from './IconHeader.scss';

const IconHeader = ({ title, subtitle, children, localStyles=[] }) => {
   const iconStyles = [styles.icon]
   if (localStyles.length > 0) {
      localStyles.forEach(style => iconStyles.push(style))
   }
   return (
      <header className={`KambiWidget-card-text-color KambiWidget-card-border-color KambiWidget-font ${styles.header}`}>
         <div className={iconStyles.join(' ')}>
            {children}
         </div>
         <div className={styles.container}>
            <div className={styles.title} title={title}>{title}</div>
            <div className={styles.subtitle} title={subtitle}>{subtitle}</div>
         </div>
      </header>
   )
}

/**
 * @property [localStyles] {Array} Array of local styles as strings
 * @property [children] {ReactElement} Header's icon markup
 * @property title {string} Header's title
 * @property [subtitle] {string} Header's subtitle
 */
IconHeader.propTypes = {
   localStyles: PropTypes.arrayOf(PropTypes.string),
   children: PropTypes.node,
   title: PropTypes.string.isRequired,
   subtitle: PropTypes.string
};

export default IconHeader;
