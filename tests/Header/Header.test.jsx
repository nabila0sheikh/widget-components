/* eslint-env jest */
import React, { Children } from 'react';
import Header from '../../src/Header/Header';
import { mount } from 'enzyme';
import { coreLibrary, widgetModule } from 'kambi-widget-core-library';
import ReactShallowRenderer from 'react-test-renderer/shallow';

let renderer;

jest.mock('kambi-widget-core-library', () => ({
   widgetModule: {
      setWidgetHeight: jest.fn(),
      adaptWidgetHeight: jest.fn()
   },
   coreLibrary: {
      pageInfo: {
         pageType: 'home'
      }
   }
}));

describe('Header DOM rendering', () => {

   beforeEach(() => {
      coreLibrary.pageInfo.pageType = 'home';
      renderer = new ReactShallowRenderer();
   });

   it('renders correctly with default props', () => {
      expect(renderer.render(
         <Header>Test</Header>
      )).toMatchSnapshot();
   });

   it('renders correctly with pageType != \'home\'', () => {
      coreLibrary.pageInfo.pageType = 'not_home';

      expect(renderer.render(
         <Header>Test</Header>
      )).toMatchSnapshot();
   });

   it('renders correctly with custom classes', () => {
      expect(renderer.render(
         <Header customClasses={'a b c'}>Test</Header>
      )).toMatchSnapshot();
   });

});

describe('Header behaviour', () => {

   beforeEach(() => {
      widgetModule.setWidgetHeight.mockClear();
      widgetModule.adaptWidgetHeight.mockClear();
      coreLibrary.pageInfo.pageType = 'home';
   });

   it('mounts in hidden state correctly', () => {
      mount(
         <Header hidden={true}>Test</Header>
      );

      expect(widgetModule.setWidgetHeight).toHaveBeenCalledTimes(1);
   });

   it('handles clicks correctly', () => {
      const wrapper = mount(
         <Header
            collapsable={true}
            customClasses='header-handle'
         >
            Test
         </Header>
      );

      wrapper.find('.header-handle').simulate('click');
      expect(widgetModule.setWidgetHeight).toHaveBeenCalledTimes(1);

      wrapper.find('.header-handle').simulate('click');
      expect(widgetModule.adaptWidgetHeight).toHaveBeenCalledTimes(1);
   });

   it('calls onExpand/onCollapse correctly', () => {
      const onExpandMock = jest.fn(),
         onCollapseMock = jest.fn();

      const wrapper = mount(
         <Header
            collapsable={true}
            onExpand={onExpandMock}
            onCollapse={onCollapseMock}
            customClasses='header-handle'
         >
            Test
         </Header>
      );

      wrapper.find('.header-handle').simulate('click');
      expect(onExpandMock).not.toHaveBeenCalled();
      expect(onCollapseMock).toHaveBeenCalledTimes(1);
      expect(widgetModule.setWidgetHeight).toHaveBeenCalledTimes(1);
      onExpandMock.mockClear();
      onCollapseMock.mockClear();

      wrapper.find('.header-handle').simulate('click');
      expect(onExpandMock).toHaveBeenCalledTimes(1);
      expect(onCollapseMock).not.toHaveBeenCalled();
      expect(widgetModule.adaptWidgetHeight).toHaveBeenCalledTimes(1);
   });

   it('ignores clicks when collapsable is not set', () => {
      const onExpandMock = jest.fn(),
         onCollapseMock = jest.fn();

      const wrapper = mount(
         <Header
            onExpand={onExpandMock}
            onCollapse={onCollapseMock}
            customClasses='header-handle'
         >
            Test
         </Header>
      );

      wrapper.find('.header-handle').simulate('click');
      expect(onExpandMock).not.toHaveBeenCalled();
      expect(onCollapseMock).not.toHaveBeenCalled();

      wrapper.find('.header-handle').simulate('click');
      expect(onExpandMock).not.toHaveBeenCalled();
      expect(onCollapseMock).not.toHaveBeenCalled();
   });
});
