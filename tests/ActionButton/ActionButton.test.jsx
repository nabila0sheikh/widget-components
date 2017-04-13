/* eslint-env jest */
import React, { Children } from 'react';
import ActionButton from '../../src/ActionButton/ActionButton';
import { shallow } from 'enzyme';
import ReactShallowRenderer from 'react-test-renderer/shallow';

let renderer;

describe('ActionButton DOM rendering', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <ActionButton action={() => {}}>Test</ActionButton>
      )).toMatchSnapshot();
   });

   it('renders correctly when disabled', () => {
      expect(renderer.render(
         <ActionButton
            action={() => {}}
            disabled={true}
         >
            Test
         </ActionButton>
      )).toMatchSnapshot();
   });

   it('renders correctly with type set to \'secondary\'', () => {
      expect(renderer.render(
         <ActionButton
            action={() => {}}
            type='secondary'
         >
            Test
         </ActionButton>
      )).toMatchSnapshot();
   });

});

describe('ActionButton behaviour', () => {

   it('handles clicks correctly', () => {
      const actionMock = jest.fn();

      const wrapper = shallow(
         <ActionButton action={actionMock}>Test</ActionButton>
      );

      expect(actionMock).not.toHaveBeenCalled();

      wrapper.find('button').simulate('click');

      expect(actionMock).toHaveBeenCalledTimes(1);
   });

});
