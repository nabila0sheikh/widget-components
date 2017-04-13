/* eslint-env jest */
import React from 'react';
import ItemContainer from '../../src/List/ItemContainer';
import ReactShallowRenderer from 'react-test-renderer/shallow';
import { shallow, mount } from 'enzyme';

let renderer;

describe('ItemContainer view', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <ItemContainer />
      )).toMatchSnapshot();
   });

   it('renders correctly selected state', () => {
      expect(renderer.render(
         <ItemContainer selected={true} />
      )).toMatchSnapshot();
   });

   it('renders correctly with one child element', () => {
      expect(renderer.render(
         <ItemContainer>One</ItemContainer>
      )).toMatchSnapshot();
   });

   it('renders correctly with many child elements', () => {
      expect(renderer.render(
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

   it('unmounts correctly', () => {
      const wrapper = mount(<ItemContainer />);
      wrapper.unmount();
   });


   it('calls onWidth on window resize', () => {
      const mockOnWidth = jest.fn();

      const wrapper = mount(<ItemContainer onWidth={mockOnWidth} />);

      expect(mockOnWidth).toHaveBeenCalledTimes(1);

      window.dispatchEvent(new Event('resize'));

      expect(mockOnWidth).toHaveBeenCalledTimes(2);

   });


   it('behaves correctly when onWidth is not set', () => {
      const wrapper = mount(<ItemContainer />);

      window.dispatchEvent(new Event('resize'));
   });


});
