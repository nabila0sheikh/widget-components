import React from 'react';
import ArrowButton from '../../../src/List/ScrolledList/ArrowButton';
import ReactTestRenderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';

describe('ArrowButton view', () => {

   it('renders "left" and "right" variants correctly', () => {
      const onClickMock = jest.fn();

      const tree = ReactTestRenderer.create(
         <div>
            <ArrowButton onClick={onClickMock} type="left" />
            <ArrowButton onClick={onClickMock} type="right" />
         </div>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly when disabled', () => {
      const onClickMock = jest.fn();

      const tree = ReactTestRenderer.create(
         <ArrowButton onClick={onClickMock} type="left" disabled={true} />
      ).toJSON();

      expect(tree).toMatchSnapshot();
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
