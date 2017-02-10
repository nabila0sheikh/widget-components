import React, { PropTypes } from 'react';
import styles from './ArrowButton.scss';

const ArrowButton = ({ type, disabled, onClick, backgroundColor }) => {
   // if buttons backgroundColor is not explicitly set
   // the body's backgroundColor will be used
   if (!backgroundColor) {
      if (typeof window.getComputedStyle != 'function') {
         backgroundColor = '#fff';
      } else {
         backgroundColor = window.getComputedStyle(document.body).getPropertyValue('background-color');
      }
   }

   const style = {
      background: `linear-gradient(${type == 'left' ? 90 : 270}deg, ${backgroundColor} 50%, rgba(255, 255, 255, 0))`
   };

   return (
      <button
         className={styles[type]}
         style={style}
         onClick={onClick}
         disabled={disabled}
      >
         <svg className={styles.icon} width='10px' height='17px' viewBox='0 860 420 500' version='1.1' xmlns='http://www.w3.org/2000/svg'>
            <path
               id='arrowLeft'
               transform='scale(1, -1) translate(0, -1500)'
               d='M358.286 640q0-7.429-5.714-13.143l-224.571-224.571 224.571-224.571q5.714-5.714
               5.714-13.143t-5.714-13.143l-28.571-28.571q-5.714-5.714-13.143-5.714t-13.143 5.714l-266.286
               266.286q-5.714 5.714-5.714 13.143t5.714 13.143l266.286 266.286q5.714 5.714
               13.143 5.714t13.143-5.714l28.571-28.571q5.714-5.714 5.714-13.143z'
            />
         </svg>
      </button>
   );
};

ArrowButton.propTypes = {
   /*
    * Arrow direction - left or right
    */
   type: PropTypes.oneOf(['left', 'right']).isRequired,

   /*
    * On click handler
    */
   onClick: PropTypes.func.isRequired,

   /*
    * Should button be disabled?
    * Defaults to false.
    */
   disabled: PropTypes.bool,


   /*
    * Color which will be used in button's background gradient.
    * Defaults to document.body background-color.
    */
   backgroundColor: PropTypes.string
};

ArrowButton.defaultProps = {
   disabled: false,
   backgroundColor: null
};

export default ArrowButton;
