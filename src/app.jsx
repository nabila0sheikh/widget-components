/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/no-danger */
/* eslint-disable no-alert */
import React from 'react';
import ReactDOM from 'react-dom';
import { coreLibrary } from 'kambi-widget-core-library';
import reactElementToJSXString from 'react-element-to-jsx-string';
import { Header, TabPagination, ScrolledList, FixedList, ActionButton } from './components';


const TestContainer = ({ description, element }) => {
   const elementString = reactElementToJSXString(element, {
      showDefaultProps: false,
      showFunctions: true,
      tabStop: 3,
      useBooleanShorthandSyntax: false
   });

   return (
      <div className='test-container'>
         <div className='header'>
            <h2>{element.type.name}</h2>
            { description }
         </div>
         <div className='code'>
            <h3>Code</h3>
            <pre>
               <code
                  className='language-html'
                  dangerouslySetInnerHTML={{
                     __html: window.Prism.highlight(elementString, window.Prism.languages.html)
                  }}
               />
            </pre>
         </div>
         <div className='example'>
            <h3>Working example</h3>
            <div className='component'>
               { element }
            </div>
         </div>
      </div>
   );
};

TestContainer.propTypes = {
   description: React.PropTypes.string.isRequired,
   element: React.PropTypes.element
};

let count = 1;
const render = function(description, element) {
   ReactDOM.render(
      <TestContainer description={description} element={element} />,
      document.getElementById('component' + count)
   );
   count++;
};

coreLibrary.init({}).then(() => {

   render(
      'Header with kambi default black background, header should be 40px in height',
      <Header
         customClasses='l-flexbox l-pl-16 l-pr-16 KambiWidget-card-support-text-color KambiWidget-header l-pt-8 l-pb-8'
      >
         <span>Lorem ipsum dolor sit amet</span>
      </Header>
   );

   render(
      'Tab Pagination component',
      <TabPagination>
         <div>Content #1</div>
         <div>Content #2</div>
         <div>Content #3</div>
      </TabPagination>
   );

   render(
      'Scrolled List component with custom alignment of items (ScrolledList.ALIGN_ITEMS.SPACE_AROUND)',
      <ScrolledList alignItems={ScrolledList.ALIGN_ITEMS.SPACE_AROUND}>
         <div>Item #1</div>
         <div>Item #2</div>
         <div>Item #3</div>
      </ScrolledList>
   );

   render(
      'Fixed List component',
      <FixedList>
         <div>Item #1</div>
         <div>Item #2</div>
         <div>Item #3</div>
      </FixedList>
   );

   render(
      'Primary ActionButton',
      <ActionButton
         action={() => { alert('this is the ActionButton action') }}
         type='primary'
         disabled={false}
      >
         place your bet
      </ActionButton>
   );

   render(
      'Disabled Primary ActionButton',
      <ActionButton
         action={() => { alert('this is the ActionButton action') }}
         type='primary'
         disabled={true}
      >
         place your bet
      </ActionButton>
   );

   render(
      'Secondary ActionButton',
      <ActionButton
         action={() => { alert('this is the ActionButton action') }}
         type='secondary'
         disabled={false}
      >
         add
      </ActionButton>
   );

   render(
      'Disabled Secondary ActionButton',
      <ActionButton
         action={() => { alert('this is the ActionButton action') }}
         type='secondary'
         disabled={true}
      >
         add
      </ActionButton>
   );
});
