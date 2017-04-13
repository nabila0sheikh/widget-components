/* eslint-env jest */
import React, { Children } from 'react';
import IconHeader from '../../src/IconHeader/IconHeader';
import ReactShallowRenderer from 'react-test-renderer/shallow';

let renderer;

describe('IconHeader DOM rendering', () => {

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

   it('renders correctly with title', () => {
      expect(renderer.render(
         <IconHeader title="test" />
      )).toMatchSnapshot();
   });

   it('renders correctly with title and subtitle', () => {
      expect(renderer.render(
         <IconHeader title="test" subtitle="Test subtitle" />
      )).toMatchSnapshot();
   });

   it('renders correctly with inner element', () => {
      expect(renderer.render(
         <IconHeader title="test">
            <div>Icon</div>
         </IconHeader>
      )).toMatchSnapshot();
   });

});
