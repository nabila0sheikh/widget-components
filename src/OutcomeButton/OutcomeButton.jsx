import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  coreLibrary,
  widgetModule,
  utilModule,
  updatesModule,
} from 'kambi-widget-core-library'
import OutcomeButtonUI from './OutcomeButtonUI'

/*
 * Returns initial state.
 * @param {object} outcome Outcome entity
 * @returns {{selected: boolean}}
 */
const getInitialState = outcome => {
  return {
    selected: widgetModule.betslipIds.indexOf(outcome.id) !== -1,
    // information that is compared when getting updated betoffers
    currentOutcomeInfo: getOutcomeInfo(outcome),
  }
}

const getOutcomeInfo = (outcome, suspended = false) => {
  return {
    odds: outcome.odds,
    oddsAmerican: outcome.oddsAmerican,
    oddsFractional: outcome.oddsFractional,
    label: outcome.label,
    suspended,
  }
}

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
    super(props)

    this.toggleOutcome = this.toggleOutcome.bind(this)

    // compute initial state
    this.state = getInitialState(this.props.outcome)
    this.oddsFormatChangedHandler = () => this.forceUpdate()
    this.betoffersUpdatedHandler = this.betoffersUpdatedHandler.bind(this)
    this.betslipUpdatedHandler = this.betslipUpdatedHandler.bind(this)
  }

  /*
    * Called just before component mounting
    */
  componentDidMount() {
    this.subscribeToEvents(this.props.event, this.props.outcome)
  }

  /*
    * Called just before changing properties of component
    * @param {object} nextProps New properties
    */
  componentWillReceiveProps(nextProps) {
    this.unsubscribeFromEvents(this.props.outcome)
    this.subscribeToEvents(nextProps.event, nextProps.outcome)
    this.setState(getInitialState(nextProps.outcome))
  }

  /*
    * Called just before component unmounting
    */
  componentWillUnmount() {
    this.unsubscribeFromEvents(this.props.outcome)
  }

  betslipUpdatedHandler(data) {
    let selected = false
    for (let i = 0; i < data.outcomes.length; i++) {
      const outcome = data.outcomes[i]
      if (outcome.id === this.props.outcome.id) {
        selected = true
      }
    }
    this.setState({
      selected,
    })
  }

  /*
   * Handles updates from the eventUpdatesModule
   */
  betoffersUpdatedHandler(data) {
    const boid = this.props.outcome.betOfferId
    let newbo = null
    if (data.betoffers == null) {
      return
    }
    for (let i = 0; i < data.betoffers.length; i++) {
      const bo = data.betoffers[i]
      if (bo.id === boid) {
        newbo = bo
        break
      }
    }
    if (newbo == null) {
      return
    }
    let newoutcome = null
    for (let i = 0; i < newbo.outcomes.length; i++) {
      const outcome = newbo.outcomes[i]
      if (this.props.outcome.id) {
        newoutcome = outcome
        break
      }
    }
    if (newoutcome == null) {
      this.setState({
        currentOutcomeInfo: null,
      })
      return
    }
    const currOutcomeInfo = this.state.currentOutcomeInfo
    const newOutcomeInfo = getOutcomeInfo(newoutcome, newbo.suspended)
    // comparing the new outcome with the old one, if they are different update the state
    let update = false
    Object.keys(currOutcomeInfo).forEach(key => {
      if (currOutcomeInfo[key] !== newOutcomeInfo[key]) {
        update = true
      }
    })
    if (update) {
      this.setState({
        currentOutcomeInfo: newOutcomeInfo,
      })
    }
  }

  /*
   * Subscribes to external events related to this component instance
   * @param {object} outcome Outcome entity
   */
  subscribeToEvents(event, outcome) {
    if (event.openForLiveBetting) {
      updatesModule.subscribe.allLiveBetoffers(
        event.id,
        this.betoffersUpdatedHandler
      )
    } else {
      updatesModule.subscribe.allPreMatchBetoffers(
        event.id,
        this.betoffersUpdatedHandler
      )
    }
    updatesModule.subscribe.betslipOutcomes(this.betslipUpdatedHandler)
    updatesModule.subscribe.oddsFormat(this.oddsFormatChangedHandler)
  }

  /*
   * Unsubscribes from external events related to this component instance
   * @param {object} outcome Outcome entity
   */
  unsubscribeFromEvents(outcome) {
    updatesModule.unsubscribe(this.oddsFormatChangedHandler)
    updatesModule.unsubscribe(this.betoffersUpdatedHandler)
    updatesModule.unsubscribe(this.betslipUpdatedHandler)
  }

  /*
    * Handles outcome button's click event
    */
  toggleOutcome() {
    if (this.state.selected) {
      widgetModule.removeOutcomeFromBetslip(this.props.outcome.id)
    } else {
      widgetModule.addOutcomeToBetslip(this.props.outcome.id)
    }
  }

  /*
    * Properly formatted odds
    * @returns {number}
    */
  get oddsFormatted() {
    switch (coreLibrary.oddsFormat) {
      case 'fractional':
        return this.state.currentOutcomeInfo.oddsFractional
      case 'american':
        return this.state.currentOutcomeInfo.oddsAmerican
      default:
        return utilModule.getOddsDecimalValue(
          this.state.currentOutcomeInfo.odds / 1000
        )
    }
  }

  /*
    * Button's label
    * @returns {string|null}
    */
  get label() {
    if (typeof this.props.label === 'string') {
      return this.props.label
    }

    if (this.props.label === false) {
      return null
    }

    if (this.props.event) {
      return utilModule.getOutcomeLabel(this.props.outcome, this.props.event)
    } else {
      return this.state.currentOutcomeInfo.label
    }
  }

  /*
    * Returns component's template
    * @returns {XML}
    */
  render() {
    // outcomes <= 1.0 do not make sense but still appears in the API sometimes
    if (
      this.state.currentOutcomeInfo == null ||
      this.state.currentOutcomeInfo.odds <= 1000
    ) {
      return <div style={{ display: 'none' }} />
    }
    return (
      <OutcomeButtonUI
        label={this.label}
        odds={this.oddsFormatted}
        suspended={this.state.currentOutcomeInfo.suspended}
        selected={this.state.selected}
        onClick={this.toggleOutcome}
        outlineStyle={this.props.outlineStyle}
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
  outcome: PropTypes.object.isRequired,
  event: PropTypes.object.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
}

OutcomeButton.defaultProps = {
  label: true,
  outlineStyle: false,
}

export default OutcomeButton
