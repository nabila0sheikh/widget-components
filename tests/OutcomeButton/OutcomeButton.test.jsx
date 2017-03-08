/* eslint-env jest */
import React, { Children } from 'react';
import OutcomeButton from '../../src/OutcomeButton/OutcomeButton';
import ReactTestUtils from 'react-addons-test-utils';
import { mount, shallow } from 'enzyme';
import { coreLibrary, eventsModule, widgetModule, utilModule } from 'kambi-widget-core-library';

let mockBetslipIds = [],
   mockEventHandlers = {};

const outcome = {
   id: 5,
   odds: 4500,
   oddsFractional: '3.5',
   oddsAmerican: '1/100',
   betOfferId: 103
};

const event = {
   betOffers: [{
      id: outcome.betOfferId
   }]
};

jest.mock('kambi-widget-core-library', () => ({
   eventsModule: {
      subscribe: jest.fn((event, handler) => mockEventHandlers[event] = handler),
      unsubscribe: jest.fn()
   },
   widgetModule: {
      get betslipIds() { return mockBetslipIds; },
      addOutcomeToBetslip: jest.fn(),
      removeOutcomeFromBetslip: jest.fn()
   },
   utilModule: {
      getOddsDecimalValue: _ => _.toFixed(1),
      getOutcomeLabel: () => 'Outcome label from util'
   },
   coreLibrary: {
      config: {
         oddsFormat: 'decimal'
      }
   }
}));

describe('OutcomeButtonUI DOM rendering', () => {

   beforeEach(() => {
      coreLibrary.config.oddsFormat = 'decimal';
   });

   it('render invisible div if odds <= 1000', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButton
            outcome={{
               id: 5,
               odds: 1000,
               oddsFractional: '1.0',
               oddsAmerican: '1.0',
               betOfferId: 103
            }}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with default props', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButton outcome={outcome} />
      )).toMatchSnapshot();
   });

   it('renders correctly with no label', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButton outcome={outcome} label={false} />
      )).toMatchSnapshot();
   });

   it('renders correctly with label explicitly set', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButton outcome={outcome} label='Test label' />
      )).toMatchSnapshot();
   });

   it('renders correctly with label extracted from event', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButton outcome={outcome} event={event} label={true} />
      )).toMatchSnapshot();
   });

   it('renders correctly with fractional odds', () => {
      coreLibrary.config.oddsFormat = 'fractional';

      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButton outcome={outcome} />
      )).toMatchSnapshot();
   });

   it('renders correctly with american odds', () => {
      coreLibrary.config.oddsFormat = 'american';

      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButton outcome={outcome} />
      )).toMatchSnapshot();
   });

});

describe('OutcomeButton behaviour', () => {

   beforeEach(() => {
      coreLibrary.config.oddsFormat = 'decimal';
      eventsModule.subscribe.mockClear();
      eventsModule.unsubscribe.mockClear();
      widgetModule.addOutcomeToBetslip.mockClear();
      widgetModule.removeOutcomeFromBetslip.mockClear();
      mockEventHandlers = {};
   });

   it('renders correctly on odds format change', () => {
      const wrapper = mount(
         <OutcomeButton outcome={outcome} />
      );

      expect(wrapper.debug()).toMatchSnapshot();

      coreLibrary.config.oddsFormat = 'american';

      mockEventHandlers['ODDS:FORMAT']();

      expect(wrapper.debug()).toMatchSnapshot();
   });

   it('subscribes to events on mount correctly', () => {
      expect(eventsModule.subscribe).not.toHaveBeenCalled();

      mount(<OutcomeButton outcome={outcome} />);

      expect(eventsModule.subscribe).toHaveBeenCalledTimes(3);
   });

   it('unsubscribes from events on mount correctly', () => {
      const wrapper = shallow(<OutcomeButton outcome={outcome} />);

      expect(eventsModule.unsubscribe).not.toHaveBeenCalled();

      wrapper.unmount();

      expect(eventsModule.unsubscribe).toHaveBeenCalledTimes(3);
   });

   it('adds and removes outcome to/from betslip correctly', () => {
      const wrapper = mount(
         <OutcomeButton outcome={outcome} />
      );

      expect(widgetModule.addOutcomeToBetslip).not.toHaveBeenCalled();
      expect(widgetModule.removeOutcomeFromBetslip).not.toHaveBeenCalled();

      // add outcome to betslip
      wrapper.find('button').simulate('click');

      mockEventHandlers[`OUTCOME:ADDED:${outcome.id}`]();

      expect(widgetModule.addOutcomeToBetslip).toHaveBeenCalledTimes(1);

      // remove outcome from betslip
      wrapper.find('button').simulate('click');

      mockEventHandlers[`OUTCOME:REMOVED:${outcome.id}`]();

      expect(widgetModule.removeOutcomeFromBetslip).toHaveBeenCalledTimes(1);
   });

   it('setups correctly when receives new props', () => {
      const wrapper = shallow(<OutcomeButton outcome={outcome} />);
      wrapper.setProps({ outcome });

      expect(eventsModule.subscribe).toHaveBeenCalledTimes(3);
      expect(eventsModule.unsubscribe).toHaveBeenCalledTimes(3);
   });

});
