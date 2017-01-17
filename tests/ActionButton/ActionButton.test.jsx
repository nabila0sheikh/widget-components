import React, { Children } from 'react';
import ActionButton from '../../src/ActionButton/ActionButton';
import ReactTestRenderer from 'react-test-renderer';
import { shallow } from 'enzyme';

describe('ActionButton DOM rendering', () => {

   it('renders correctly with default props', () => {
      const tree = ReactTestRenderer.create(
         <ActionButton action={() => {}}>Test</ActionButton>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly when disabled', () => {
      const tree = ReactTestRenderer.create(
         <ActionButton
            action={() => {}}
            disabled={true}
         >
            Test
         </ActionButton>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with type set to \'secondary\'', () => {
      const tree = ReactTestRenderer.create(
         <ActionButton
            action={() => {}}
            type='secondary'
         >
            Test
         </ActionButton>
      ).toJSON();

      expect(tree).toMatchSnapshot();
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
