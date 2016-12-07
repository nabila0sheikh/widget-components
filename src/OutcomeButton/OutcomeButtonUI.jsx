import React, { Component } from 'react';
import styles from './OutcomeButtonUI.scss';

/**
 * Renders the UI of an outcome button, no
 * special handling logic.
 * @memberof widget-components
 */
class OutcomeButtonUI extends Component {

   render() {
      const { label, odds, suspended, selected, onClick } = this.props;

      let buttonCssClasses = 'l-flex-1 kw-link KambiWidget-outcome';

      if (suspended) {
         buttonCssClasses += ' KambiWidget-outcome--suspended';
      } else if (selected) {
         buttonCssClasses += ' KambiWidget-outcome--selected';
      }

      if (odds === null && label === null) {
         throw new Error('Both odds and label cannot be set to null');
      }

      return (
         <button
            type='button'
            role='button'
            className={buttonCssClasses}
            disabled={suspended}
            onClick={onClick}
         >
            {odds !== null && label !== null &&
               <div className='KambiWidget-outcome__flexwrap'>
                  <div className='KambiWidget-outcome__label-wrapper'>
                     <span className='KambiWidget-outcome__label'>{label}</span>
                     <span className='KambiWidget-outcome__line' />
                  </div>
                  <div className='KambiWidget-outcome__odds-wrapper'>
                     <span className='KambiWidget-outcome__odds'>{odds}</span>
                  </div>
               </div>}

            {odds !== null && label === null &&
               <div className='KambiWidget-outcome__odds-wrapper'>
                  <span className='KambiWidget-outcome__odds'>{odds}</span>
               </div>}

            {odds === null && label !== null &&
               <div className={`KambiWidget-outcome__label-wrapper ${styles.label}`}>
                  <span className='KambiWidget-outcome__label'>{label}</span>
               </div>}
         </button>
      );
   }
}

/**
 * @property [label=null] {string?} if not defined centralizes the odds in the button, if defined uses this as the label in the button
 * @property [odds=null] {string?} if not defined centralizes the label in the button, if defined shows the odds in the button (either centralized or on the right side if label is defined)
 * @property [suspended=false] {boolean} If true the button is greyed out
 * @property selected {boolean} If true the button is selected, false otherwise.
 * @property onClick {Function} Callback for when the button is clicked
 */
OutcomeButtonUI.propTypes = {
   label: React.PropTypes.string,
   odds: React.PropTypes.string,
   suspended: React.PropTypes.bool,
   selected: React.PropTypes.bool.isRequired,
   onClick: React.PropTypes.func
};

OutcomeButtonUI.defaultProps = {
   odds: null,
   label: null,
   suspended: false,
   selected: false
};

export default OutcomeButtonUI;
