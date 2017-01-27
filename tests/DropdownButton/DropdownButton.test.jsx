/* eslint-env jest */
import React, { Children } from 'react';
import DropdownButton from '../../src/DropdownButton/DropdownButton';
import ReactTestRenderer from 'react-test-renderer';
import { mount, shallow } from 'enzyme';

describe('DropdownButton DOM rendering', () => {

   it('renders correctly with default props', () => {
      const options = ['option1', 'option2'];

      const tree = ReactTestRenderer.create(
         <DropdownButton options={options} onChange={() => {}} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with changed alignment', () => {
      const options = ['option1', 'option2'];

      const tree = ReactTestRenderer.create(
         <DropdownButton
            options={options}
            onChange={() => {}}
            horizontalAlignment='left'
            verticalAlignment='bottom'
         />
      );

      expect(tree.toJSON()).toMatchSnapshot();
   });

});

describe('DropdownButton behaviour', () => {

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

      const tmpClientHeight = document.documentElement.clientHeight,
         tmpInnerHeight = window.innerHeight;

      document.documentElement.clientHeight = 100;
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

      document.documentElement.clientHeight = tmpClientHeight;
      window.innerHeight = tmpInnerHeight;
   });

});
