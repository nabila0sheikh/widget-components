/* eslint-env jest */
import React, { Children } from 'react';
import IconHeader from '../../src/IconHeader/IconHeader';
import ReactTestUtils from 'react-addons-test-utils';

describe('IconHeader DOM rendering', () => {

   it('renders correctly with title', () => {
      expect(ReactTestUtils.createRenderer().render(
         <IconHeader title="test" />
      )).toMatchSnapshot();
   });

   it('renders correctly with title and subtitle', () => {
      expect(ReactTestUtils.createRenderer().render(
         <IconHeader title="test" subtitle="Test subtitle" />
      )).toMatchSnapshot();
   });

   it('renders correctly with inner element', () => {
      expect(ReactTestUtils.createRenderer().render(
         <IconHeader title="test">
            <div>Icon</div>
         </IconHeader>
      )).toMatchSnapshot();
   });

});
