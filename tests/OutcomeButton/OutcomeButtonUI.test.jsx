/* eslint-env jest */
import React, { Children } from 'react';
import OutcomeButtonUI from '../../src/OutcomeButton/OutcomeButtonUI';
import ReactTestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';

describe('OutcomeButtonUI DOM rendering', () => {

   it('renders correctly when neither selected nor suspended', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButtonUI odds='2.0' selected={false} suspended={false} />
      )).toMatchSnapshot();
   });

   it('renders correctly when selected', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButtonUI odds='2.0' selected={true} />
      )).toMatchSnapshot();
   });

   it('renders correctly when selected', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButtonUI odds='2.0' selected={false} suspended={true} />
      )).toMatchSnapshot();
   });

   it('throws error when both odds and label are not provided', () => {
      expect(() => {
         ReactTestUtils.createRenderer().render(
            <OutcomeButtonUI selected={true}/>
         );
      }).toThrowErrorMatchingSnapshot();
   });

   it('renders correctly with label', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButtonUI label='Test label' selected={false} />
      )).toMatchSnapshot();
   });

   it('renders correctly with odds and label', () => {
      expect(ReactTestUtils.createRenderer().render(
         <OutcomeButtonUI odds='5.0' label='Test label' selected={false} />
      )).toMatchSnapshot();
   });

});

describe('OutcomeButtonUI behaviour', () => {

   it('handles clicks correctly', () => {
      const onClickMock = jest.fn();

      const wrapper = shallow(
         <OutcomeButtonUI odds='1.2' selected={true} onClick={onClickMock} />
      );

      expect(onClickMock).not.toHaveBeenCalled();

      wrapper.find('button').simulate('click');
      expect(onClickMock).toHaveBeenCalledTimes(1);
   });

});
