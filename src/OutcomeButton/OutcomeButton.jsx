import React, { Component } from 'react';
import { coreLibrary, widgetModule, utilModule } from 'kambi-widget-core-library';
import OutcomeButtonUI from './OutcomeButtonUI';


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

      this.toggleOutcome = this.toggleOutcome.bind(this);

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
   componentDidMount() {
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
      if (typeof this.props.label === 'string') {
         return this.props.label;
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
    * Returns component's template.
    * @returns {XML}
    */
   render() {
      return (
         <OutcomeButtonUI
            label={this.label}
            odds={this.oddsFormatted}
            suspended={this.betOffer ? this.betOffer.suspended : false}
            selected={this.state.selected}
            onClick={this.toggleOutcome}
         />
      )
   }
}

OutcomeButton.propTypes = {
   /**
    * Outcome entity
    */
   outcome: React.PropTypes.object.isRequired,

   /**
    * Event entity, if not provided some type of outcomes may not show the correct label.
    */
   event: React.PropTypes.object,

   /**
    * Label to show, optional
    * If boolean and false don't show label
    * If boolean and true use the providedevent and the outcome to determine the label
    * If string uses that as label
    */
   label: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.bool
   ]),
};

OutcomeButton.defaultProps = {
   withLabel: false
};

export default OutcomeButton;
