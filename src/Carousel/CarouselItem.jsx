import React, { Component } from 'react';
import PropTypes from 'prop-types'
import styles from './CarouselItem.scss'

function Link({ action, children }) {
   return (
      <a href={action} target='_blank' rel='noopener noreferrer'>
         {children}
      </a>
   )
}

Link.propTypes = {
   action: PropTypes.string.isRequired,
   children: PropTypes.node.isRequired,
}


class CarouselItem extends Component {

   constructor() {
      super()

      this.state = {
         swiping: false
      }
   }
   render() {
      return (
         <li className='carousel-item'>
            {this.props.children}
         </li>
      )
   }
}

CarouselItem.propTypes = {
   children: PropTypes.node.isRequired
}

export default CarouselItem
