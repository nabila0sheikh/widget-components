/* eslint-env jest */
import React, { Children } from 'react';
import OutcomeButtonUI from '../../src/OutcomeButton/OutcomeButtonUI';
import ReactTestRenderer from 'react-test-renderer';
import { shallow } from 'enzyme';

describe('OutcomeButtonUI DOM rendering', () => {

   it('renders correctly when neither selected nor suspended', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButtonUI odds='2.0' selected={false} suspended={false} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly when selected', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButtonUI odds='2.0' selected={true} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly when selected', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButtonUI odds='2.0' selected={false} suspended={true} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('throws error when both odds and label are not provided', () => {
      expect(() => {
         ReactTestRenderer.create(
            <OutcomeButtonUI selected={true}/>
         );
      }).toThrowErrorMatchingSnapshot();
   });

   it('renders correctly with label', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButtonUI label='Test label' selected={false} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with odds and label', () => {
      const tree = ReactTestRenderer.create(
         <OutcomeButtonUI odds='5.0' label='Test label' selected={false} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
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
