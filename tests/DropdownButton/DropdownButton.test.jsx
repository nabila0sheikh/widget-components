/* eslint-env jest */
import React, { Children } from 'react';
import DropdownButton from '../../src/DropdownButton/DropdownButton';
import { mount, shallow } from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';

const renderer = ReactTestUtils.createRenderer();

// retrieve initial global values
const innerHeight = window.innerHeight,
   clientHeight = document.documentElement.clientHeight;

describe('DropdownButton DOM rendering', () => {

   it('renders correctly with default props', () => {
      const options = ['option1', 'option2'];

      expect(renderer.render(
         <DropdownButton options={options} onChange={() => {}} />
      )).toMatchSnapshot();
   });

   it('renders correctly with changed alignment', () => {
      const options = ['option1', 'option2'];

      expect(renderer.render(
         <DropdownButton
            options={options}
            onChange={() => {}}
            horizontalAlignment='left'
            verticalAlignment='bottom'
         />
      )).toMatchSnapshot();
   });

});

describe('DropdownButton behaviour', () => {

   beforeEach(() => {
      window.innerHeight = innerHeight;
      Object.defineProperty(document.documentElement, 'clientHeight', { get: () => clientHeight, configurable: true });
   });

   it('expands and collapses correctly', () => {
      const options = ['option1', 'option2'],
         clickEvMock = { stopPropagation: jest.fn() };

      const wrapper = mount(
         <DropdownButton
            options={options}
            onChange={() => {}}
         />
      );

      wrapper.find('button').simulate('click', clickEvMock);

      expect(clickEvMock.stopPropagation).toHaveBeenCalledTimes(1);

      window.document.documentElement.dispatchEvent(new Event('click'));
   });

   it('handles switching option correctly', () => {
      const options = ['option1', 'option2'],
         onChangeMock = jest.fn(),
         clickEvMock = { stopPropagation: jest.fn() };

      Object.defineProperty(document.documentElement, 'clientHeight', { get: () => 100, configurable: true });
      window.innerHeight = 0;

      const wrapper = mount(
         <DropdownButton
            options={options}
            onChange={onChangeMock}
            verticalAlignment='bottom'
         />
      );

      wrapper.find('button').simulate('click', clickEvMock);

      expect(clickEvMock.stopPropagation).toHaveBeenCalledTimes(1);
      expect(onChangeMock).not.toHaveBeenCalled();

      const eventMock = new Event('click');
      Object.defineProperty(
         eventMock,
         'target',
         {
            value: wrapper.find('li[data-kw-dropdown-button-index=1]').node,
            enumerable: true
         }
      );

      window.document.documentElement.dispatchEvent(eventMock);

      expect(onChangeMock).toHaveBeenCalledTimes(1);

      wrapper.find('button').simulate('click', clickEvMock);

      expect(clickEvMock.stopPropagation).toHaveBeenCalledTimes(2);

      window.document.documentElement.dispatchEvent(eventMock);

      expect(onChangeMock).toHaveBeenCalledTimes(1); // not called again
   });

});
