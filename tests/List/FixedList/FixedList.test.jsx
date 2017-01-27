/* eslint-env jest */
import React from 'react';
import FixedList from '../../../src/List/FixedList/FixedList';
import ReactTestRenderer from 'react-test-renderer';
import { mount, shallow } from 'enzyme';

describe('FixedList view', () => {

   it('renders correctly with default props', () => {
      const tree = ReactTestRenderer.create(
         <FixedList />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with one child item', () => {
      const tree = ReactTestRenderer.create(
         <FixedList>
            <div />
         </FixedList>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with many child items', () => {
      const tree = ReactTestRenderer.create(
         <FixedList>
            <div>1</div>
            <div>2</div>
            {[<div key="3">3</div>, <div key="4">4</div>]}
         </FixedList>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with selected item given arbitrary', () => {
      const tree = ReactTestRenderer.create(
         <FixedList selected={1}>
            <div>1</div>
            <div>2</div>
         </FixedList>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly custom ItemContainer', () => {
      const tree = ReactTestRenderer.create(
         <FixedList
            renderItemContainer={({ selected, onClick, onWidth, children }) => <div>{children}</div>}
         >
            <div>1</div>
            <div>2</div>
         </FixedList>
      );

      expect(tree).toMatchSnapshot();
   });

});

describe('FixedList interface', () => {

   it('calls onItemClick properly', () => {
      const onItemClickMock = jest.fn();

      const wrapper = mount(
         <FixedList onItemClick={onItemClickMock}>
            <div>1</div>
            <div>2</div>
            <div id="goingToBeClicked">3</div>
         </FixedList>
      );

      expect(onItemClickMock).not.toHaveBeenCalled();

      wrapper.find('#goingToBeClicked').simulate('click');

      expect(onItemClickMock).toHaveBeenCalledTimes(1);
      expect(onItemClickMock).toHaveBeenCalledWith(2);
   });

   it('handles item clicks correctly', () => {
      const renderItemContainerMock = jest.fn(({ selected, onClick, onWidth, children }) => {
         return <div onClick={onClick}>{children}</div>;
      });

      const wrapper = mount(
         <FixedList renderItemContainer={renderItemContainerMock}>
            <div>1</div>
            <div>2</div>
            <div id="goingToBeClicked">3</div>
         </FixedList>
      );

      expect(renderItemContainerMock).toHaveBeenCalledTimes(3);

      renderItemContainerMock.mockClear();

      wrapper.find('#goingToBeClicked').simulate('click');

      expect(renderItemContainerMock).toHaveBeenCalledTimes(3);
   });

});
