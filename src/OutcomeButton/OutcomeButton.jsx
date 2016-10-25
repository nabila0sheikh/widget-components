import React, { Component } from 'react';
import { coreLibrary, widgetModule, utilModule } from 'kambi-widget-core-library';

/**
 * Converts map of CSS classes into className string
 * @param {object<string, bool>} classNames Map of CSS classes
 * @returns {string}
 */
const convertClassNames = (classNames) => {
   return Object.keys(classNames)
      .reduce((str, key) => str + (classNames[key] ? ` ${key}` : ''), '');
};

/**
 * Returns initial state.
 * @param {object} outcome Outcome entity
 * @returns {{selected: boolean}}
 */
const getInitialState = (outcome) => {
   return {
      selected: widgetModule.betslipIds.indexOf(outcome.id) !== -1
   };
};

/**
 * Renders an outcome button.
 */
class OutcomeButton extends Component {

   /**
    * Outcome component constructor.
    * @param {object} props Component properties
    */
   constructor(props) {
      super(props);

      // compute initial state
      this.state = getInitialState(props.outcome);

      // set up bound event handlers
      this.outcomeAddedHandler = () => this.setState({ selected: true });
      this.outcomeRemovedHandler = () => this.setState({ selected: false });
      this.oddsFormatChangedHandler = () => this.forceUpdate();
   }

   /**
    * Called just before component mounting.
    */
   componentWillMount() {
      this.subscribeToEvents(this.props.outcome);
   }

   /**
    * Called just before changing properties of component.
    * @param {object} nextProps New properties
    */
   componentWillReceiveProps(nextProps) {
      this.unsubscribeFromEvents(this.props.outcome);
      this.subscribeToEvents(nextProps.outcome);
      this.setState(getInitialState(nextProps.outcome));
   }

   /**
    * Called just before component unmounting.
    */
   componentWillUnmount() {
      this.unsubscribeFromEvents(this.props.outcome);
   }

   /**
    * Subscribes to external events related to this component instance.
    * @param {object} outcome Outcome entity
    */
   subscribeToEvents(outcome) {
      widgetModule.events.subscribe(`OUTCOME:ADDED:${outcome.id}`, this.outcomeAddedHandler);
      widgetModule.events.subscribe(`OUTCOME:REMOVED:${outcome.id}`, this.outcomeRemovedHandler);
      widgetModule.events.subscribe('ODDS:FORMAT', this.oddsFormatChangedHandler);
   }

   /**
    * Unsubscribes from external events related to this component instance.
    * @param {object} outcome Outcome entity
    */
   unsubscribeFromEvents(outcome) {
      widgetModule.events.unsubscribe(`OUTCOME:ADDED:${outcome.id}`, this.outcomeAddedHandler);
      widgetModule.events.unsubscribe(`OUTCOME:REMOVED:${outcome.id}`, this.outcomeRemovedHandler);
      widgetModule.events.unsubscribe('ODDS:FORMAT', this.oddsFormatChangedHandler);
   }

   /**
    * Handles outcome button's click event.
    */
   toggleOutcome() {
      if (this.state.selected) {
         widgetModule.removeOutcomeFromBetslip(this.props.outcome.id);
      } else {
         widgetModule.addOutcomeToBetslip(this.props.outcome.id);
      }
   }

   /**
    * Bet offer entity which matches given outcome
    * @returns {object|null}
    */
   get betOffer() {
      if (this.props.event == null || this.props.event.betOffers == null) {
         return null;
      }

      return this.props.event.betOffers
         .find(betOffer => betOffer.id === this.props.outcome.betOfferId);
   }

   /**
    * Properly formatted odds
    * @returns {number}
    */
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

   /**
    * Button's label
    * @returns {*}
    */
   get label() {
      if (this.props.customLabel) {
         return this.props.customLabel;
      }

      if (this.props.outcome == null) {
         return null;
      }

      if (this.props.event) {
         return utilModule.getOutcomeLabel(this.props.outcome, this.props.event);
      } else {
         return this.props.outcome.label;
      }
   }

   /**
    * Computed className based on current state
    * @returns {string}
    */
   get className() {
      return convertClassNames({
         'KambiWidget-outcome': true,
         'kw-link': true,
         'l-flex-1': true,
         'KambiWidget-outcome--selected': this.state.selected,
         'KambiWidget-outcome--suspended': this.betOffer ? this.betOffer.suspended : false
      });
   }

   /**
    * Component template (without label)
    * @returns {XML}
    */
   get template() {
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

   /**
    * Component template (with label)
    * @returns {XML}
    */
   get templateWithLabel() {
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

   /**
    * Returns component's template.
    * @returns {XML}
    */
   render() {
      return this.props.withLabel ? this.templateWithLabel : this.template;
   }
}

OutcomeButton.propTypes = {
   /**
    * Outcome entity
    */
   outcome: React.PropTypes.object.isRequired,

   /**
    * Event entity
    */
   event: React.PropTypes.object,

   /**
    * Controls whether label should be included in button.
    */
   withLabel: React.PropTypes.bool,

   /**
    * Custom label to be shown (once withLabel=true).
    */
   customLabel: React.PropTypes.string
};

OutcomeButton.defaultProps = {
   withLabel: false
};

export default OutcomeButton;
