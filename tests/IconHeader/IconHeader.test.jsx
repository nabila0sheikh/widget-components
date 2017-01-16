import React, { Children } from 'react';
import IconHeader from '../../src/IconHeader/IconHeader';
import ReactTestRenderer from 'react-test-renderer';

describe('IconHeader DOM rendering', () => {

   it('renders correctly with title', () => {
      const tree = ReactTestRenderer.create(
         <IconHeader title="test" />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with title and subtitle', () => {
      const tree = ReactTestRenderer.create(
         <IconHeader title="test" subtitle="Test subtitle" />
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

   it('renders correctly with inner element', () => {
      const tree = ReactTestRenderer.create(
         <IconHeader title="test">
            <div>Icon</div>
         </IconHeader>
      ).toJSON();

      expect(tree).toMatchSnapshot();
   });

});
