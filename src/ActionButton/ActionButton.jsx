import React from 'react';
import styles from './ActionButton.scss';

/* eslint-disable react/prefer-stateless-function */
class ResetSelectionButton extends React.Component {
   render() {
      let buttonClassName = `${styles.button} ${styles[this.props.type]} `;

      let backgroundClassName = `${styles.background} `;

      if (this.props.type === 'primary') {
         buttonClassName += 'KambiWidget-primary-color'; backgroundClassName += 'KambiWidget-primary-color';
      } else {
         buttonClassName += 'KambiWidget-card-text-color';
         backgroundClassName += 'KambiWidget-card-support-text-color';
      }

      return (
         <div className={styles.container}>
            <button
               disabled={this.props.disabled}
               className={buttonClassName}
               onClick={this.props.action}
            >
               { this.props.children }
            </button>
            <div className={backgroundClassName} />
         </div>
      );
   }
}

ResetSelectionButton.propTypes = {
   action: React.PropTypes.func.isRequired,
   children: React.PropTypes.node.isRequired,
   disabled: React.PropTypes.bool,
   type: React.PropTypes.oneOf(['primary', 'secondary'])
};

ResetSelectionButton.defaultProps = {
   disabled: false,
   type: 'primary'
};

export default ResetSelectionButton;
