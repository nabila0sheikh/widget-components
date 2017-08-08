/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/no-danger */
/* eslint-disable no-alert */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { coreLibrary } from 'kambi-widget-core-library';
import reactElementToJSXString from 'react-element-to-jsx-string';
import { Header, TabPagination, ScrolledList, FixedList, ActionButton, IconHeader, Carousel } from './components';


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
         {/* <div className='code'>
            <h3>Code</h3>
            <pre>
               <code
                  className='language-html'
                  dangerouslySetInnerHTML={{
                     __html: window.Prism.highlight(elementString, window.Prism.languages.html)
                  }}
               />
            </pre>
         </div> */}
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
   description: PropTypes.string.isRequired,
   element: PropTypes.element
};

const render = function(description, element) {
   const div = document.createElement('div');
   document.body.append(div);
   ReactDOM.render(
      <TestContainer description={description} element={element} />,
      div
   );
};

coreLibrary.init({}).then(() => {

   // render(
   //    'Carousel with 6 items',
   //    <Carousel>
   //       <div><h3>1</h3></div>
   //       <div><h3>2</h3></div>
   //       <div><h3>3</h3></div>
   //       <div><h3>4</h3></div>
   //       <div><h3>5</h3></div>
   //       <div><h3>6</h3></div>
   //    </Carousel>
   // );

   render(
      'Carousel with 3 images',
      <Carousel>
         <div>
            <img alt='img1' src='http://lorempixel.com/900/500/sports/1/' />
            <div className='carousel-legend'>
               <p>Legend 1</p>
            </div>
         </div>
         <div>
            <img alt='img2'src='http://lorempixel.com/900/500/sports/2/' />
            <div className='carousel-legend'>
               <p>Legend 1</p>
            </div>
         </div>
         <div>
            <img alt='img3'src='http://lorempixel.com/900/500/sports/3/' />
            <div className='carousel-legend'>
               <p>Legend 1</p>
            </div>
         </div>
      </Carousel>
   );


});
