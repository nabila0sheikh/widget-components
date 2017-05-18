/* eslint-env jest */
import React, { Children } from 'react';
import TabPagination from '../../src/TabPagination/TabPagination';
import ReactShallowRenderer from 'react-test-renderer/shallow';
import { mount } from 'enzyme';

let renderer;

describe('TabPagination DOM rendering', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <TabPagination />
      )).toMatchSnapshot();
   });

   it('renders correctly with one child item', () => {
      expect(renderer.render(
         <TabPagination>
            <div />
         </TabPagination>
      )).toMatchSnapshot();
   });

   it('renders correctly with many child items', () => {
      expect(renderer.render(
         <TabPagination>
            <div>1</div>
            <div>2</div>
            {[<div key="3">3</div>, <div key="4">4</div>]}
         </TabPagination>
      )).toMatchSnapshot();
   });

   it('renders correctly with selected item given arbitrary', () => {
      expect(renderer.render(
         <TabPagination selected={1}>
            <div>1</div>
            <div>2</div>
         </TabPagination>
      )).toMatchSnapshot();
   });

   it('renders correctly with custom renderTab func', () => {
      const renderTabMock = (i) => <div key={i}>Tab #{i}</div>;

      expect(renderer.render(
         <TabPagination renderTab={renderTabMock}>
            <div>1</div>
            <div>2</div>
         </TabPagination>
      )).toMatchSnapshot();
   });

   it('renders correctly with custom renderTabList func', () => {
      const renderTabListMock = ({selected, children}) =>
         <div>
            {Children.map(children, (child, i) =>
               <div className={selected == i ? 'sel' : 'not_sel'}>
                  {child}
               </div>)}
         </div>;

      expect(renderer.render(
         <TabPagination renderTabList={renderTabListMock}>
            <div>1</div>
            <div>2</div>
         </TabPagination>
      )).toMatchSnapshot();
   });

});

describe('TabPagination behaviour', () => {

   it('switches tab correctly with custom renderTab func', () => {
      const renderTabMock = jest.fn(i => <div key={i} className={`tabMock_${i}`}>{i}</div>);

      const wrapper = mount(
         <TabPagination
            renderTab={renderTabMock}
         >
            <div>1</div>
            <div>2</div>
         </TabPagination>
      );

      wrapper.find('.tabMock_1').simulate('click');
   });

});

describe('TabPagination onTabChange callback', () => {

   beforeAll(() => {
      jest.useFakeTimers();
   });

   it('is called correctly after tab change', () => {
      const renderTabMock = jest.fn(i => <div key={i} className={`tabMock_${i}`}>{i}</div>);

      const onTabChangeMock = jest.fn();

      const wrapper = mount(
         <TabPagination
            renderTab={renderTabMock}
            onTabChange={onTabChangeMock}
         >
            <div>1</div>
            <div>2</div>
         </TabPagination>
      );

      wrapper.find('.tabMock_1').simulate('click');

      expect(onTabChangeMock).not.toHaveBeenCalled();

      jest.runOnlyPendingTimers();

      expect(onTabChangeMock).toHaveBeenCalledTimes(1);
      expect(onTabChangeMock).toHaveBeenCalledWith(1);
   });

});
