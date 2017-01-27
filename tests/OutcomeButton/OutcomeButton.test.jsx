/* eslint-env jest */
import React, { Children } from 'react';
import OutcomeButton from '../../src/OutcomeButton/OutcomeButton';
import ReactTestRenderer from 'react-test-renderer';
import { mount, shallow } from 'enzyme';
import { coreLibrary, eventsModule, widgetModule, utilModule } from 'kambi-widget-core-library';

let mockOddsFormat = 'decimal',
   mockBetslipIds = [],
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
         get oddsFormat() { return mockOddsFormat; }
      }
   }
}));

describe('OutcomeButtonUI DOM rendering', () => {

   it('renders correctly with default props', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButton outcome={outcome} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with no label', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButton outcome={outcome} label={false} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with label explicitly set', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButton outcome={outcome} label='Test label' />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with label extracted from event', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButton outcome={outcome} event={event} label={true} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with fractional odds', () => {
      const tmpMockOddsFormat = mockOddsFormat;

      mockOddsFormat = 'fractional';

      const tree = ReactTestRenderer.create(
         <OutcomeButton outcome={outcome} />
      ).toJSON();

      expect(tree).toMatchSnapshot();

      mockOddsFormat = tmpMockOddsFormat;
   });

   it('renders correctly with american odds', () => {
      const tmpMockOddsFormat = mockOddsFormat;

      mockOddsFormat = 'american';

      const tree = ReactTestRenderer.create(
         <OutcomeButton outcome={outcome} />
      ).toJSON();

      expect(tree).toMatchSnapshot();

      mockOddsFormat = tmpMockOddsFormat;
   });

   it('renders correctly on odds format change', () => {
      const tmpMockOddsFormat = mockOddsFormat;

      mockOddsFormat = 'decimal';

      const tree = ReactTestRenderer.create(
         <OutcomeButton outcome={outcome} />
      ).toJSON();

      expect(tree).toMatchSnapshot();

      mockOddsFormat = 'american';

      mockEventHandlers['ODDS:FORMAT']();

      expect(tree).toMatchSnapshot();

      mockOddsFormat = tmpMockOddsFormat;
   });

});

describe('OutcomeButton behaviour', () => {

   it('subscribes to events on mount correctly', () => {
      eventsModule.subscribe.mockClear();

      expect(eventsModule.subscribe).not.toHaveBeenCalled();

      const wrapper = mount(<OutcomeButton outcome={outcome} />);

      expect(eventsModule.subscribe).toHaveBeenCalledTimes(3);

      eventsModule.subscribe.mockClear();
   });

   it('unsubscribes from events on mount correctly', () => {
      eventsModule.unsubscribe.mockClear();

      const wrapper = shallow(<OutcomeButton outcome={outcome} />);

      expect(eventsModule.unsubscribe).not.toHaveBeenCalled();

      wrapper.unmount();

      expect(eventsModule.unsubscribe).toHaveBeenCalledTimes(3);

      eventsModule.unsubscribe.mockClear();
   });

   it('adds and removes outcome to/from betslip correctly', () => {
      widgetModule.addOutcomeToBetslip.mockClear();
      widgetModule.removeOutcomeFromBetslip.mockClear();

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

      widgetModule.addOutcomeToBetslip.mockClear();
      widgetModule.removeOutcomeFromBetslip.mockClear();
      mockEventHandlers = {};
   });

   it('setups correctly when receives new props', () => {
      eventsModule.subscribe.mockClear();
      eventsModule.unsubscribe.mockClear();

      const wrapper = shallow(<OutcomeButton outcome={outcome} />);
      wrapper.setProps({ outcome });

      expect(eventsModule.subscribe).toHaveBeenCalledTimes(3);
      expect(eventsModule.unsubscribe).toHaveBeenCalledTimes(3);

      eventsModule.subscribe.mockClear();
      eventsModule.unsubscribe.mockClear();
   });

});
