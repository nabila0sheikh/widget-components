import React from 'react';
import styles from './ActionButton.scss';

/* eslint-disable react/prefer-stateless-function */
class ActionButton extends React.Component {
   render() {
      let buttonClassName = `${styles.button} `;
      let buttonTextClassName = `${styles.buttonText} `;

      if (this.props.type === 'primary') {
         buttonClassName += 'KambiWidget-primary-color';
         buttonTextClassName += 'KambiWidget-primary-color';
      } else {
         buttonClassName += 'KambiWidget-card-text-color';
         buttonTextClassName += 'KambiWidget-card-text-color';
      }

      return (
         <div className={styles.container}>
            <button
               disabled={this.props.disabled}
               className={buttonClassName}
               onClick={this.props.action}
            />
            <div
               className={buttonTextClassName}
               style={this.props.disabled ? { opacity: 0.4 } : { opacity: 1 }}
            >
               { this.props.children }
            </div>
         </div>
      );
   }
}

ActionButton.propTypes = {
   action: React.PropTypes.func.isRequired,
   children: React.PropTypes.node.isRequired,
   disabled: React.PropTypes.bool,
   type: React.PropTypes.oneOf(['primary', 'secondary'])
};

ActionButton.defaultProps = {
   disabled: false,
   type: 'primary'
};

export default ActionButton;
