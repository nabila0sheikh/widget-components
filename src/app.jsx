/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/no-danger */
/* eslint-disable no-alert */
import React from 'react';
import ReactDOM from 'react-dom';
import { coreLibrary } from 'kambi-widget-core-library';
import reactElementToJSXString from 'react-element-to-jsx-string';
import { Header } from './components';


const TestContainer = ({ description, element }) => {
   const elementString = reactElementToJSXString(element, {
      showDefaultProps: false,
      showFunctions: true,
      tabStop: 3,
      useBooleanShorthandSyntax: false
   });
   return (
      <div>
         <div className='description'>
            { description }
         </div>
         <pre>
            <code
               className='language-html'
               dangerouslySetInnerHTML={{
                  __html: window.Prism.highlight(elementString, window.Prism.languages.html)
               }}
            />
         </pre>
         <div className='component'>
            { element }
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

   ReactDOM.render(
      <Header
         collapsable={true}
         onCollapse={() => { alert('collapsing') }}
         onExpand={() => { alert('uncollapsing') }}
      >
         Collapsable Header, alerts on collapsing/uncollapsing, should be 37px height
      </Header>, document.getElementById('collapsable-header'));

   render(
      'Header with kambi default black background, header should be 40px in height',
      <Header
         customClasses='l-flexbox l-pl-16 l-pr-16 KambiWidget-card-support-text-color KambiWidget-header l-pt-8 l-pb-8'
      >
         <span>Lorem ipsum dolor sit amet</span>
      </Header>
   );
});
