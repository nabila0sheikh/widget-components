import React from 'react';
import { utilModule } from 'widget-core-library';
import OutcomeComponent from './OutcomeComponent';

class OutcomeWithLabelComponent extends OutcomeComponent {

   get label() {
      if (this.props.customLabel) {
         return this.props.customLabel;
      }

      if (this.props.outcome == null) {
         return;
      }

      if (this.props.event) {
         return utilModule.getOutcomeLabel(this.props.outcome, this.props.event);
      } else {
         return this.props.outcome.label;
      }
   }

   render() {
      return (
         <button
           type="button"
           role="button"
           disabled={this.betOffer ? this.betOffer.suspended : false}
           className={this.className}
           onClick={this.toggleOutcome.bind(this)}
         >
            <div className="KambiWidget-outcome__flexwrap">
               <div className="KambiWidget-outcome__label-wrapper">
                  <span className="KambiWidget-outcome__label">{this.label}</span>
                  <span className="KambiWidget-outcome__line" />
               </div>
               <div className="KambiWidget-outcome__odds-wrapper">
                  <span className="KambiWidget-outcome__odds">{this.oddsFormatted}</span>
               </div>
            </div>
         </button>
      );
   }
}

OutcomeWithLabelComponent.propTypes = Object.assign(
   OutcomeComponent.propTypes,
   { customLabel: React.PropTypes.string }
);

export default OutcomeWithLabelComponent;
