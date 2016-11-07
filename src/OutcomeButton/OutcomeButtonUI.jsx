import React from 'react';

/**
 * Renders the UI of an outcome button, no
 * special handling logic.
 */
const OutcomeButtonUI = ({ label, odds, suspended, selected, onClick }) => {
   let buttonCssClasses = 'l-flex-1 kw-link KambiWidget-outcome';
   if (suspended) {
      buttonCssClasses += ' KambiWidget-outcome--suspended';
   } else if (selected) {
      buttonCssClasses += ' KambiWidget-outcome--selected';
   }
   if (label == null) {
      return (
         <button
            type="button"
            role="button"
            className={buttonCssClasses}
            disabled={suspended}
            onClick={onClick}
         >
            <div className="l-flexbox l-pack-center">
               <div className="KambiWidget-outcome__odds-wrapper">
                  <span className="KambiWidget-outcome__odds">
                     {odds}
                  </span>
               </div>
            </div>
         </button>
      );

   } else {

      return (
         <button
            type="button"
            role="button"
            className={buttonCssClasses}
            disabled={suspended}
            onClick={onClick}
         >
            <div className="KambiWidget-outcome__flexwrap">
               <div className="KambiWidget-outcome__label-wrapper">
                  <span className="KambiWidget-outcome__label">
                     {label}
                  </span>
                  <span className="KambiWidget-outcome__line" />
               </div>
               <div className="KambiWidget-outcome__odds-wrapper">
                  <span className="KambiWidget-outcome__odds">
                     {odds}
                  </span>
               </div>
            </div>
         </button>
      );
   }
}

OutcomeButtonUI.propTypes = {
   /**
    * If null changes the layout of the button to not show a label
    * If string uses that as the label
    */
   label: React.PropTypes.string,

   /**
    * Odds to show
    */
   odds: React.PropTypes.string.isRequired,

   /**
    * If the button is enabled or not (greyed out)
    */
   suspended: React.PropTypes.bool,

   /**
    * If the button is selected or not
    */
   selected: React.PropTypes.bool.isRequired,

   /**
    * Callback for when the button is clicked
    */
   onClick: React.PropTypes.instanceOf(Function)
};

OutcomeButtonUI.defaultProps = {
   label: null,
   suspended: false
};

export default OutcomeButtonUI;
