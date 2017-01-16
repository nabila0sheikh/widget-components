import React, { Children } from 'react';
import Header from '../../src/Header/Header';
import ReactTestRenderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { widgetModule } from 'kambi-widget-core-library';

let mockPageType = 'home';

jest.mock('kambi-widget-core-library', () => ({
   widgetModule: {
      setWidgetHeight: jest.fn(),
      adaptWidgetHeight: jest.fn()
   },
   coreLibrary: {
      pageInfo: {
         get pageType() { return mockPageType; }
      }
   }
}));

describe('Header DOM rendering', () => {

   it('renders correctly with default props', () => {
      mockPageType = 'home';

      const tree = ReactTestRenderer.create(
         <Header>Test</Header>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with pageType != \'home\'', () => {
      mockPageType = 'not_home';

      const tree = ReactTestRenderer.create(
         <Header>Test</Header>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with custom classes', () => {
      mockPageType = 'home';

      const tree = ReactTestRenderer.create(
         <Header customClasses={'a b c'}>Test</Header>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

});

describe('Header behaviour', () => {

   it('mounts in hidden state correctly', () => {
      widgetModule.setWidgetHeight.mockClear();

      mockPageType = 'home';

      const wrapper = mount(
         <Header hidden={true}>Test</Header>
      );

      expect(widgetModule.setWidgetHeight).toHaveBeenCalledTimes(1);
   });

   it('handles clicks correctly', () => {
      widgetModule.setWidgetHeight.mockClear();
      widgetModule.adaptWidgetHeight.mockClear();

      mockPageType = 'home';

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
      widgetModule.setWidgetHeight.mockClear();
      widgetModule.adaptWidgetHeight.mockClear();

      mockPageType = 'home';

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
      mockPageType = 'home';

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
