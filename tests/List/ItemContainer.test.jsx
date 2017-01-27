/* eslint-env jest */
import React from 'react';
import ItemContainer from '../../src/List/ItemContainer';
import ReactTestRenderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';

describe('ItemContainer view', () => {

   it('renders correctly with default props', () => {
      const tree = ReactTestRenderer.create(
         <ItemContainer />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly selected state', () => {
      const tree = ReactTestRenderer.create(
         <ItemContainer selected={true} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with one child element', () => {
      const tree = ReactTestRenderer.create(
         <ItemContainer>One</ItemContainer>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with many child elements', () => {
      const tree = ReactTestRenderer.create(
         <ItemContainer>
            One
            Two
            <ul>
               <li>Three</li>
            </ul>
         </ItemContainer>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

});

describe('ItemContainer interface', () => {

   it('handles click events correctly', () => {
      const onClickMock = jest.fn();

      const wrapper = shallow(
         <ItemContainer onClick={onClickMock} />
      );

      expect(onClickMock).not.toHaveBeenCalled();

      wrapper.first().simulate('click');

      expect(onClickMock).toHaveBeenCalledTimes(1);
   });

   it('calls onWidth after mounting', () => {
      const onWidthMock = jest.fn();

      mount(<ItemContainer onWidth={onWidthMock} />);

      expect(onWidthMock).toHaveBeenCalledTimes(1);
   });

});
