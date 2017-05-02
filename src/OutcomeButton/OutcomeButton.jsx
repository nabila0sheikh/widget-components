import React, { Component } from 'react';
import { coreLibrary, widgetModule, utilModule, eventsModule } from 'kambi-widget-core-library';
import OutcomeButtonUI from './OutcomeButtonUI';


/*
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
 * Outcome button component. This component renders an outcome with or without a label. It automatically adds/removes the outcome to/from the betslip when the user clicks the button. Besides that it also automatically rerenders itself when the user changes the odds format
 *
 * This component uses the OutcomeButtonUI behind the scenes, if you don't want the automatic functionality mentioned before you should use OutcomeButtonUI
 * @memberof widget-components
 */
class OutcomeButton extends Component {

   /*
    * Outcome component constructor
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

   /*
    * Called just before component mounting
    */
   componentDidMount() {
      this.subscribeToEvents(this.props.outcome);
   }

   /*
    * Called just before changing properties of component
    * @param {object} nextProps New properties
    */
   componentWillReceiveProps(nextProps) {
      this.unsubscribeFromEvents(this.props.outcome);
      this.subscribeToEvents(nextProps.outcome);
      this.setState(getInitialState(nextProps.outcome));
   }

   /*
    * Called just before component unmounting
    */
   componentWillUnmount() {
      this.unsubscribeFromEvents(this.props.outcome);
   }

   /*
    * Subscribes to external events related to this component instance
    * @param {object} outcome Outcome entity
    */
   subscribeToEvents(outcome) {
      eventsModule.subscribe(`OUTCOME:ADDED:${outcome.id}`, this.outcomeAddedHandler);
      eventsModule.subscribe(`OUTCOME:REMOVED:${outcome.id}`, this.outcomeRemovedHandler);
      eventsModule.subscribe('ODDS:FORMAT', this.oddsFormatChangedHandler);
   }

   /*
    * Unsubscribes from external events related to this component instance
    * @param {object} outcome Outcome entity
    */
   unsubscribeFromEvents(outcome) {
      eventsModule.unsubscribe(`OUTCOME:ADDED:${outcome.id}`, this.outcomeAddedHandler);
      eventsModule.unsubscribe(`OUTCOME:REMOVED:${outcome.id}`, this.outcomeRemovedHandler);
      eventsModule.unsubscribe('ODDS:FORMAT', this.oddsFormatChangedHandler);
   }

   /*
    * Handles outcome button's click event
    */
   toggleOutcome() {
      if (this.state.selected) {
         widgetModule.removeOutcomeFromBetslip(this.props.outcome.id);
      } else {
         widgetModule.addOutcomeToBetslip(this.props.outcome.id);
      }
   }

   /*
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

   /*
    * Properly formatted odds
    * @returns {number}
    */
   get oddsFormatted() {
      switch (coreLibrary.oddsFormat) {
         case 'fractional':
            return this.props.outcome.oddsFractional;
         case 'american':
            return this.props.outcome.oddsAmerican;
         default:
            return utilModule.getOddsDecimalValue(this.props.outcome.odds / 1000);
      }
   }

   /*
    * Button's label
    * @returns {string|null}
    */
   get label() {
      if (typeof this.props.label === 'string') {
         return this.props.label;
      }

      if (this.props.label === false) {
         return null;
      }

      if (this.props.event) {
         return utilModule.getOutcomeLabel(this.props.outcome, this.props.event);
      } else {
         return this.props.outcome.label;
      }
   }

   /*
    * Returns component's template
    * @returns {XML}
    */
   render() {
      // outcomes <= 1.0 do not make sense but still appears in the API sometimes
      if (this.props.outcome.odds <= 1000) {
         return (
            <div style={{ display: 'none' }} />
         )
      }
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


/**
 * @property outcome {Object} The Outcome object provided by the calls from the offeringModule
 * @property [event] {Object} the Event object provided by the calls from the offeringModule. If not provided will some types of outcomes may not show the correct label. If the "label" prop is false this prop is not used
 * @property [label=true] {string|boolean} Label to show. If boolean and false don't show any label, only the odds, if boolean and true use the provided event and the outcome to determine the label, if string uses it as the label
 */
OutcomeButton.propTypes = {
   outcome: React.PropTypes.object.isRequired,
   event: React.PropTypes.object,
   label: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.bool
   ])
};

OutcomeButton.defaultProps = {
   label: true
};

export default OutcomeButton;
