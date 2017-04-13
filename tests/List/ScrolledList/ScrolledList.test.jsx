/* eslint-env jest */

import React from 'react';
import ScrolledList from '../../../src/List/ScrolledList/ScrolledList';
import ReactShallowRenderer from 'react-test-renderer/shallow';
import { mount } from 'enzyme'; // eslint-disable-line

let renderer;

describe('ScrolledList DOM rendering', () => {

   beforeEach(() => {
      if ('ontouchstart' in window) {
         delete window.ontouchstart;
      }

      renderer = new ReactShallowRenderer();
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <ScrolledList />
      )).toMatchSnapshot();
   });

   it('renders correctly with one child item', () => {
      expect(renderer.render(
         <ScrolledList>
            <div />
         </ScrolledList>
      )).toMatchSnapshot();
   });

   it('renders correctly with many child items', () => {
      expect(renderer.render(
         <ScrolledList>
            <div>1</div>
            <div>2</div>
            {[<div key='3'>3</div>, <div key='4'>4</div>]}
         </ScrolledList>
      )).toMatchSnapshot();
   });

   it('renders correctly with selected item given arbitrary', () => {
      expect(renderer.render(
         <ScrolledList selected={1}>
            <div>1</div>
            <div>2</div>
         </ScrolledList>
      )).toMatchSnapshot();
   });

   it('renders correctly custom ItemContainer', () => {
      expect(renderer.render(
         <ScrolledList
            renderItemContainer={({ selected, onClick, onWidth, children }) => <div>{children}</div>}
         >
            <div>1</div>
            <div>2</div>
         </ScrolledList>
      )).toMatchSnapshot();
   });

   it('renders correctly all item alignments', () => {
      Object.keys(ScrolledList.ALIGN_ITEMS).forEach((key) => {
         expect(renderer.render(
            <ScrolledList alignItems={ScrolledList.ALIGN_ITEMS[key]}>
               <div>1</div>
               <div>2</div>
            </ScrolledList>
         )).toMatchSnapshot();
      });
   });

   it('renders correctly with disabled controls', () => {
      expect(renderer.render(
         <ScrolledList showControls={false}>
            <div>1</div>
            <div>2</div>
         </ScrolledList>
      )).toMatchSnapshot();
   });

   it('renders correctly on touch screen', () => {
      window.ontouchstart = () => {};

      expect(renderer.render(
         <ScrolledList>
            <div>1</div>
            <div>2</div>
         </ScrolledList>
      )).toMatchSnapshot();
   });

   it('renders correctly all SCROLL_TO_ITEM_MODE settings', () => {
      Object.keys(ScrolledList.SCROLL_TO_ITEM_MODE).forEach((key) => {
         expect(renderer.render(
            <ScrolledList
               scrollToItemMode={ScrolledList.SCROLL_TO_ITEM_MODE[key]}
               selected={0}
            >
               <div>1</div>
               <div>2</div>
            </ScrolledList>
         )).toMatchSnapshot();

         expect(renderer.render(
            <ScrolledList
               scrollToItemMode={ScrolledList.SCROLL_TO_ITEM_MODE[key]}
               selected={1}
            >
               <div>1</div>
               <div>2</div>
            </ScrolledList>
         )).toMatchSnapshot();
      });
   });

});

describe('ScrolledList behaviour', () => {

   it('calls onItemClick properly', () => {
      const onItemClickMock = jest.fn();

      const wrapper = mount(
         <ScrolledList onItemClick={onItemClickMock}>
            <div>1</div>
            <div>2</div>
            <div id='goingToBeClicked'>3</div>
         </ScrolledList>
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
         <ScrolledList renderItemContainer={renderItemContainerMock}>
            <div>1</div>
            <div>2</div>
            <div id='goingToBeClicked'>3</div>
         </ScrolledList>
      );

      expect(renderItemContainerMock).toHaveBeenCalledTimes(3);

      renderItemContainerMock.mockClear();

      wrapper.find('#goingToBeClicked').simulate('click');

      expect(renderItemContainerMock).toHaveBeenCalledTimes(3);
   });

   it('scrolls on arrows/item click correctly', () => {
      let nextButtonClick,
         prevButtonClick;

      const renderItemContainerMock = jest.fn(({ onClick, onWidth, children }) => {
         setTimeout(() => onWidth(100), 0);
         return <div onClick={onClick}>{children}</div>;
      });

      const renderNextButtonMock = jest.fn(({ onClick }) => {
         nextButtonClick = onClick;
         return <div />;
      });

      const renderPrevButtonMock = jest.fn(({ onClick }) => {
         prevButtonClick = onClick;
         return <div />;
      });

      const wrapper = mount(
         <ScrolledList
            renderItemContainer={renderItemContainerMock}
            renderNextButton={renderNextButtonMock}
            renderPrevButton={renderPrevButtonMock}
         >
            <div>1</div><div>2</div><div>3</div>
            <div>4</div><div>5</div><div>6</div>
            <div>7</div><div>8</div><div id='last'>9</div>
         </ScrolledList>
      );

      const eyeshotWrapper = wrapper.find('.eyeshot');
      Object.defineProperty(eyeshotWrapper.node, 'offsetWidth', { get: () => 300, configurable: true });

      return new Promise(resolve => setTimeout(() => resolve(), 0))
         .then(() => {
            if (!nextButtonClick) {
               throw new Error('nextButtonClick is undefined');
            }

            if (!prevButtonClick) {
               throw new Error('prevButtonClick is undefined');
            }

            expect(renderNextButtonMock).toHaveBeenCalled();
            expect(renderItemContainerMock).toHaveBeenCalled();
            expect(renderPrevButtonMock).toHaveBeenCalled();

            nextButtonClick();

            expect(eyeshotWrapper.node.scrollLeft).toEqual(200);

            prevButtonClick();

            expect(eyeshotWrapper.node.scrollLeft).toEqual(0);

            wrapper.find('#last').simulate('click');

            expect(eyeshotWrapper.node.scrollLeft).toEqual(0);
         });
   });

   it('unmounts correctly', () => {
      const wrapper = mount(<ScrolledList />);
      wrapper.unmount();
   });

   it('aligns correctly when there are less items than container width', () => {
      const renderItemContainerMock = jest.fn(({ onClick, onWidth, children }) => {
         setTimeout(() => onWidth(100), 0);
         return <div onClick={onClick}>{children}</div>;
      });

      const wrapper = mount(
         <ScrolledList renderItemContainer={renderItemContainerMock}>
            <div>1</div><div>2</div>
         </ScrolledList>
      );

      const eyeshotWrapper = wrapper.find('.eyeshot');
      Object.defineProperty(eyeshotWrapper.node, 'offsetWidth', { get: () => 300, configurable: true });

      window.dispatchEvent(new Event('resize'));

      // test subsequent resize event
      window.dispatchEvent(new Event('resize'));

      const barWrapper = wrapper.find('.bar');

      return new Promise(resolve => setTimeout(() => resolve(), 250))
         .then(() => {
            expect(barWrapper.node.style.justifyContent).toEqual('center');

            Object.defineProperty(eyeshotWrapper.node, 'offsetWidth', { get: () => 100, configurable: true });

            window.dispatchEvent(new Event('resize'));

            return new Promise(resolve => setTimeout(() => resolve(), 210));
         })
         .then(() => expect(barWrapper.node.style.justifyContent).toEqual(''));
   });

});
