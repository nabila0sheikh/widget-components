import React from 'react';
import OutcomeButton from '../../src/OutcomeButton/OutcomeButton';
import ReactTestRenderer from 'react-test-renderer';

test('Renders correctly with only required props', () => {
   const renderer = ReactTestRenderer.create(
      <OutcomeButton outcome={{ id: 1 }} />
   );

   let tree = renderer.toJSON();

   expect(tree).toMatchSnapshot();
});
