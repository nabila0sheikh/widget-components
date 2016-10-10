import React, { Component } from 'react';
import { coreLibrary, widgetModule, utilModule } from 'widget-core-library';

const convertClassNames = (classNames) => {
   return Object.keys(classNames)
      .reduce((str, key) => str + (classNames[key] ? ` ${key}` : ''), '');
};

class OutcomeComponent extends Component {

   constructor(props) {
      super(props);

      this.state = {
         selected: false
      };

      if (widgetModule.betslipIds.indexOf(props.outcome.id) !== -1) {
         this.state.selected = true;
      }

      const boundSetState = this.setState.bind(this);

      widgetModule.events.subscribe(`OUTCOME:ADDED:${props.outcome.id}`, () => boundSetState({ selected: true }));
      widgetModule.events.subscribe(`OUTCOME:REMOVED:${props.outcome.id}`, () => boundSetState({ selected: false }));
   }

   toggleOutcome() {
      if (this.state.selected) {
         widgetModule.removeOutcomeFromBetslip(this.props.outcome.id);
      } else {
         widgetModule.addOutcomeToBetslip(this.props.outcome.id);
      }
   }

   get betOffer() {
      if (this.props.event == null || this.props.event.betOffers == null) {
         return;
      }

      return this.props.event.betOffers
         .find(betOffer => betOffer.id === this.props.outcome.betOfferId);
   }

   get oddsFormatted() {
      switch (coreLibrary.config.oddsFormat) {
         case 'fractional':
            return this.props.outcome.oddsFractional;
         case 'american':
            return this.props.outcome.oddsAmerican;
         default:
            return utilModule.getOddsDecimalValue(this.props.outcome.odds / 1000);
      }
   }

   get className() {
      return convertClassNames({
         'KambiWidget-outcome': true,
         'kw-link': true,
         'l-flex-1': true,
         'KambiWidget-outcome--selected': this.state.selected,
         'KambiWidget-outcome--suspended': this.betOffer ? this.betOffer.suspended : false
      });
   }

   render() {
      return (
         <button
           type="button"
           role="button"
           className={this.className}
           disabled={this.betOffer ? this.betOffer.suspended : false}
           onClick={this.toggleOutcome.bind(this)}
         >
            <div className="l-flexbox l-pack-center">
               <div className="KambiWidget-outcome__odds-wrapper">
                  <span className="KambiWidget-outcome__odds">{this.oddsFormatted}</span>
               </div>
            </div>
         </button>
      );
   }
}

OutcomeComponent.propTypes = {
   outcome: React.PropTypes.object.isRequired,
   event: React.PropTypes.object
};

export default OutcomeComponent;
