/* eslint-env jest */
import React from 'react';
import ArrowButton from '../../../src/List/ScrolledList/ArrowButton';
import ReactShallowRenderer from 'react-test-renderer/shallow';
import { shallow } from 'enzyme';

let renderer;

const getComputedStyle = window.getComputedStyle;

describe('ArrowButton view', () => {

   beforeEach(() => {
      window.getComputedStyle = getComputedStyle;
      renderer = new ReactShallowRenderer();
   });

   it('renders "left" variant correctly', () => {
      const onClickMock = jest.fn();

      expect(renderer.render(
         <ArrowButton onClick={onClickMock} type="left" />
      )).toMatchSnapshot();
   });

   it('renders "right" variant correctly', () => {
      const onClickMock = jest.fn();

      expect(renderer.render(
         <ArrowButton onClick={onClickMock} type="right" />
      )).toMatchSnapshot();
   });

   it('renders correctly when disabled', () => {
      const onClickMock = jest.fn();

      expect(renderer.render(
         <ArrowButton onClick={onClickMock} type="left" disabled={true} />
      )).toMatchSnapshot();
   });

   it('renders correctly when background color explicitly set', () => {
      const onClickMock = jest.fn();

      expect(renderer.render(
         <ArrowButton
            onClick={onClickMock}
            type="left"
            backgroundColor="#f00"
         />
      )).toMatchSnapshot();
   });

   it('renders correctly on browser not supporting getComputedStyle', () => {
      const onClickMock = jest.fn();

      window.getComputedStyle = null;

      expect(renderer.render(
         <ArrowButton
            onClick={onClickMock}
            type="left"
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with document.body background color', () => {
      const onClickMock = jest.fn();

      window.getComputedStyle = (el) => {
         expect(el).toBe(document.body);

         return {
            getPropertyValue: (prop) => {
               expect(prop).toBe('background-color');
               return '#00ff00';
            }
         }
      };

      expect(renderer.render(
         <ArrowButton
            onClick={onClickMock}
            type="left"
         />
      )).toMatchSnapshot();
   });

});

describe('ArrowButton interface', () => {

   it('handles click events correctly', () => {
      const onClickMock = jest.fn();

      const wrapper = shallow(
         <ArrowButton onClick={onClickMock} type="left" />
      );

      expect(onClickMock).not.toHaveBeenCalled();

      wrapper.first().simulate('click');

      expect(onClickMock).toHaveBeenCalledTimes(1);
   });

});
