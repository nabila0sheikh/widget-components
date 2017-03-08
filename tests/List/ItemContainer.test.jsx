/* eslint-env jest */
import React from 'react';
import ItemContainer from '../../src/List/ItemContainer';
import ReactTestUtils from 'react-addons-test-utils';
import { shallow, mount } from 'enzyme';

describe('ItemContainer view', () => {

   it('renders correctly with default props', () => {
      expect(ReactTestUtils.createRenderer().render(
         <ItemContainer />
      )).toMatchSnapshot();
   });

   it('renders correctly selected state', () => {
      expect(ReactTestUtils.createRenderer().render(
         <ItemContainer selected={true} />
      )).toMatchSnapshot();
   });

   it('renders correctly with one child element', () => {
      expect(ReactTestUtils.createRenderer().render(
         <ItemContainer>One</ItemContainer>
      )).toMatchSnapshot();
   });

   it('renders correctly with many child elements', () => {
      expect(ReactTestUtils.createRenderer().render(
         <ItemContainer>
            One
            Two
            <ul>
               <li>Three</li>
            </ul>
         </ItemContainer>
      )).toMatchSnapshot();
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
