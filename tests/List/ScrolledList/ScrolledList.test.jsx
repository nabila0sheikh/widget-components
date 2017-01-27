/* eslint-env jest */

import React from 'react';
import ScrolledList from '../../../src/List/ScrolledList/ScrolledList';
import ReactTestRenderer from 'react-test-renderer'; // eslint-disable-line
import { shallow, mount } from 'enzyme'; // eslint-disable-line


describe('ScrolledList DOM rendering', () => {

   it('renders correctly with default props', () => {
      const tree = ReactTestRenderer.create(
         <ScrolledList />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with one child item', () => {
      const tree = ReactTestRenderer.create(
         <ScrolledList>
            <div />
         </ScrolledList>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with many child items', () => {
      const tree = ReactTestRenderer.create(
         <ScrolledList>
            <div>1</div>
            <div>2</div>
            {[<div key='3'>3</div>, <div key='4'>4</div>]}
         </ScrolledList>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with selected item given arbitrary', () => {
      const tree = ReactTestRenderer.create(
         <ScrolledList selected={1}>
            <div>1</div>
            <div>2</div>
         </ScrolledList>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly custom ItemContainer', () => {
      const tree = ReactTestRenderer.create(
         <ScrolledList
            renderItemContainer={({ selected, onClick, onWidth, children }) => <div>{children}</div>}
         >
            <div>1</div>
            <div>2</div>
         </ScrolledList>
      );

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly all item alignments', () => {
      Object.keys(ScrolledList.ALIGN_ITEMS).forEach((key) => {
         const tree = ReactTestRenderer.create(
            <ScrolledList alignItems={ScrolledList.ALIGN_ITEMS[key]}>
               <div>1</div>
               <div>2</div>
            </ScrolledList>
         ).toJSON();

         expect(tree).toMatchSnapshot();
      });
   });

   it('renders correctly in mobile mode with not known container width', () => {
      const oldUserAgent = window.navigator.userAgent;

      Object.defineProperty(window.navigator, 'userAgent', { get: () => 'iPhone', configurable: true });
      window.ontouchstart = () => {};

      const tree = ReactTestRenderer.create(
         <ScrolledList>
            <div>1</div>
            <div>2</div>
         </ScrolledList>
      );

      expect(tree).toMatchSnapshot();

      Object.defineProperty(window.navigator, 'userAgent', { get: () => oldUserAgent, configurable: true });
      delete window.ontouchstart;
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
      eyeshotWrapper.node.offsetWidth = 300;

      const barWrapper = wrapper.find('.bar');

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

            expect(eyeshotWrapper.node.scrollLeft).toEqual(0);
            expect(barWrapper.node.style.transform).toEqual('translate3d(-200px, 0, 0)');
            expect(barWrapper.node.style.mozTransform).toEqual('translate3d(-200px, 0, 0)');

            prevButtonClick();

            expect(eyeshotWrapper.node.scrollLeft).toEqual(0);
            expect(barWrapper.node.style.transform).toEqual('translate3d(0px, 0, 0)');
            expect(barWrapper.node.style.mozTransform).toEqual('translate3d(0px, 0, 0)');

            wrapper.find('#last').simulate('click');

            expect(eyeshotWrapper.node.scrollLeft).toEqual(0);
            expect(barWrapper.node.style.transform).toEqual('translate3d(0px, 0, 0)');
            expect(barWrapper.node.style.mozTransform).toEqual('translate3d(0px, 0, 0)');
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
      eyeshotWrapper.node.offsetWidth = 300;

      window.dispatchEvent(new Event('resize'));

      // test subsequent resize event
      window.dispatchEvent(new Event('resize'));

      const barWrapper = wrapper.find('.bar');

      return new Promise(resolve => setTimeout(() => resolve(), 210))
         .then(() => {
            expect(barWrapper.node.style.justifyContent).toEqual('center');

            eyeshotWrapper.node.offsetWidth = 100;

            window.dispatchEvent(new Event('resize'));

            return new Promise(resolve => setTimeout(() => resolve(), 210));
         })
         .then(() => expect(barWrapper.node.style.justifyContent).toEqual(''));
   });
});
